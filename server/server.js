const { PrismaClient } = require("@prisma/client");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const parser = require("./parser/latex-log-parser");
const fileupload = require("express-fileupload");
const app = express();
const PORT = process.env.PORT || 8080;
const latex = require("node-latex");
const { join, resolve } = require("path");
const { compileTex } = require("./parser/tex-compiler.js");
var cors = require("cors");
var fs = require("fs");
var path = require("path");
var temp = require("temp");
const bodyParser = require("body-parser");
const prisma = new PrismaClient();
app.use(cors());
app.use(fileupload());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "..", "build")));

const { hash, compare } = bcryptjs;
const SECRET_KEY = process.env.SECRET_KEY;
// Middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Please authenticate." });
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate." });
  }
};

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

app.post("/upload", function (req, res) {
  const options = {
    inputs: [resolve(join(__dirname, "/"))],
    cmd: "xelatex",
    passes: 2,
  };

  res.setHeader("Content-Type", "application/pdf");

  let buf = new Buffer.from(req.body.tex.toString("utf8"), "base64");
  let text = buf.toString();

  const pdf = latex(text, options);

  pdf.pipe(res);
  pdf.on("error", (err) => {
    console.log(err.message);
    res.removeHeader("Content-Type");
    res.status(400).send(JSON.stringify({ error: err.message }));
  });
  pdf.on("finish", () => {});
});

app.post("/compile", authenticate, function (req, res) {
  try {
    let buf = new Buffer.from(req.body.tex.toString("utf8"), "base64");
    var uid = "tempfile";
    var name = uid + ".tex";

    const data = [];
    const path = temp.mkdirSync("compile");

    fs.writeFileSync(path + "/" + name, buf.toString("utf8"));

    compileTex(path + "/" + name, "pdflatex")
      .catch((error) => {})
      .then(function (results) {
        const start = async () => {
          const stream = fs.readFileSync(path + "/" + uid + ".log", {
            encoding: "utf8",
          });

          let result = parser
            .latexParser()
            .parse(stream, { ignoreDuplicates: true });

          if (result.errors.length > 0) {
            result.errors.forEach(function (item, index) {
              data.push({
                row: --item.line,
                text: item.message,
                type: item.level,
              });
            });
          }
        };

        start().then(function (results) {
          console.log(data);
          removeDir(path);
          res.setHeader("Content-Type", "application/json");
          res.status(200).send(JSON.stringify(data));
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).send(JSON.stringify(err));
  }
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});

var removeDir = function (dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  var list = fs.readdirSync(dirPath);
  for (var i = 0; i < list.length; i++) {
    var filename = path.join(dirPath, list[i]);
    var stat = fs.statSync(filename);
    console.log("removing: " + filename);
    if (filename == "." || filename == "..") {
      // do nothing for current and parent dir
    } else if (stat.isDirectory()) {
      removeDir(filename);
    } else {
      fs.unlinkSync(filename);
    }
  }
  console.log("removing: " + dirPath);
  fs.rmdirSync(dirPath);
};

//Endpoint to register
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await hash(password, 12);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "This email is already in use" });
    }
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    return res.status(200).json(newUser);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//endpoint to login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.get("/me", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ id: user.id, email: user.email, name: user.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new project
app.post("/projects", authenticate, async (req, res) => {
  const { title, content, userId } = req.body;
  try {
    const project = await prisma.project.create({
      data: {
        title,
        content,
        userId,
      },
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read all projects
app.get("/projects", authenticate, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        updatedAt: true,
        userId: true,
      },
    });
    res.json(projects);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read a single project by ID
app.get("/projects/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ error: "Project not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a project by ID
app.put("/projects/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        title,
        content,
      },
    });
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a project by ID
app.delete("/projects/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.project.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
