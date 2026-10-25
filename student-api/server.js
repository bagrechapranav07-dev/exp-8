const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

// In-memory array of at least five student objects
let students = [
  { id: 1, name: 'Aarav Sharma', department: 'Computer Engineering', semester: 5 },
  { id: 2, name: 'Priya Nair', department: 'Information Technology', semester: 5 },
  { id: 3, name: 'Rohan Mehta', department: 'Electronics Engineering', semester: 3 },
  { id: 4, name: 'Sneha Patil', department: 'Computer Engineering', semester: 7 },
  { id: 5, name: 'Karan Joshi', department: 'Mechanical Engineering', semester: 5 }
];

// GET /students - return all students
app.get('/students', (req, res) => {
  res.status(200).json(students);
});

// GET /students/:id - return one student using route parameter
app.get('/students/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const student = students.find((s) => s.id === id);

  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  res.status(200).json(student);
});

// POST /students - accept a new student object from req.body
app.post('/students', (req, res) => {
  const { name, department, semester } = req.body;

  if (!name || !department || !semester) {
    return res.status(400).json({ error: 'name, department and semester are required' });
  }

  const newStudent = {
    id: students.length ? students[students.length - 1].id + 1 : 1,
    name,
    department,
    semester
  };

  students.push(newStudent);
  res.status(201).json(newStudent);
});

app.listen(PORT, () => {
  console.log(`Student API running on http://localhost:${PORT}`);
});
