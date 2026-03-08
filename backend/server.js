const {Client}=require('pg');
const express=require('express');
const cors = require("cors");

const app=express();
app.use(cors({
  origin: "http://localhost:5173", // Vite React app
  credentials: true
}));
app.use(express.json());

const con=new Client({
    host:'pg-arcng-surajchakma-arc.a.aivencloud.com',
    user:'dbc',
    port:16884,
    password:'dbc',
    database:'test_database',
    ssl: {
        rejectUnauthorized: false,
  },

});

con.connect().then(()=>{
    console.log('Connected to the database');
})
.catch((err)=>{
    console.error('Error connecting to the database',err);
});

app.post('/postDepartment',(req, res)=>{
    const {department_name}=req.body;
    const insert_query='INSERT INTO "Emam".department (department_name) VALUES ($1)';
    con.query(insert_query, [department_name], (err, result)=>{
        if(err){
            console.error('Error inserting data:', err);
            res.status(500).send('Error inserting data');
        } else {
            console.log(result)
            res.status(200).send('Data inserted successfully');
        }
    });
})

app.post('/postStudent',(req, res)=>{
    const {student_id, student_name, department_id}=req.body;
    const insert_query='INSERT INTO "Emam".student (student_id, student_name, department_id) VALUES ($1, $2, $3)';
    con.query(insert_query, [student_id, student_name, department_id], (err, result)=>{
        if(err){
            console.error('Error inserting data:', err);
            res.status(500).send('Error inserting data');
        } else {
            console.log(result)
            res.status(200).send('Data inserted successfully');
        }
    });
})

app.get('/getDepartment',(req, res)=>{
    const query='SELECT * FROM "Emam".department order by department_id ASC'; 
    con.query(query, (err, result)=>{
        if(err){
            res.send(err)
        } else {
            res.send(result.rows)   
        }     
    });
})  

// app.get("/getDepartment", async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;

//     const offset = (page - 1) * limit;

//     const dataQuery = `
//       SELECT *
//       FROM "Emam".department
//       ORDER BY department_id ASC
//       LIMIT $1 OFFSET $2
//     `;

//     const countQuery = `
//       SELECT COUNT(*) 
//       FROM "Emam".department
//     `;

//     const dataResult = await con.query(dataQuery, [limit, offset]);
//     const countResult = await con.query(countQuery);

//     res.json({
//       data: dataResult.rows,
//       total: parseInt(countResult.rows[0].count),
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch departments" });
//   }
// });

app.get('/getDepartmentById',(req, res)=>{
    const id = req.query.id; 
    const query='SELECT * FROM "Emam".department WHERE department_id=$1';
    con.query(query, [id], (err, result)=>{
        if(err){
            res.send(err)
        } else {
            res.send(result.rows[0])   
        }
    });
})
app.get('/getStudent',(req, res)=>{
    const query='SELECT * FROM "Emam".student'; 
    con.query(query, (err, result)=>{
        if(err){
            res.send(err)
        } else {
            res.send(result.rows)   
        }     
    });
})

app.get('/getStudentById',(req, res)=>{
    const id = req.query.id;
    const query='SELECT * FROM "Emam".student WHERE student_id=$1';
    con.query(query, [id], (err, result)=>{
        if(err){
            res.send(err)
        } else {
            res.send(result.rows[0])
        }
    });
})

app.get('/getStdWithDpt',(req, res)=>{
    const query=
        `SELECT 
                s.student_id,
                s.student_name, 
                d.department_name 
        FROM "Emam".student s
        JOIN "Emam".department d
            ON s.department_id = d.department_id
        ORDER BY s.student_name ASC
        `; 
    con.query(query, (err, result)=>{
        if(err){
            res.send(err)
        } else {
            res.send(result.rows)   
        }     
    });
})


app.get('/getStdOfDepartment', (req, res) => {
    const id = req.query.id; 

    const query = `
        SELECT student_id, student_name
	        FROM "Emam".student
	        WHERE department_id=$1
            ORDER BY student_id ASC;
    `;
    con.query(query, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }

        res.json(result.rows);
    });
});

app.put('/updateStudent/:studentId', (req, res) => {
    const { studentId } = req.params;
    const { student_name, department_id } = req.body;

    const query = `
        UPDATE "Emam".student
        SET student_name=$1, department_id=$2
        WHERE student_id=$3
    `;

    con.query(query, [student_name, department_id, studentId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Failed to update student" });
        }

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Student not found" });
        }

        return res.status(200).json({ message: "Student updated successfully" });
    });
});

app.delete('/deleteStudent/:studentId', (req, res) => {
    const { studentId } = req.params;
    const query = 'DELETE FROM "Emam".student WHERE student_id=$1';

    con.query(query, [studentId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Failed to delete student" });
        }

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Student not found" });
        }

        return res.status(200).json({ message: "Student deleted successfully" });
    });
});

app.put('/updateDepartment/:departmentId', (req, res) => {
    const { departmentId } = req.params;
    const { department_name } = req.body;
    const query = `
        UPDATE "Emam".department
        SET department_name=$1
        WHERE department_id=$2
    `;

    con.query(query, [department_name, departmentId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Failed to update department" });
        }

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Department not found" });
        }

        return res.status(200).json({ message: "Department updated successfully" });
    });
});

app.delete('/deleteDepartment/:departmentId', (req, res) => {
    const { departmentId } = req.params;
    const studentCountQuery = 'SELECT COUNT(*)::int AS total FROM "Emam".student WHERE department_id=$1';

    con.query(studentCountQuery, [departmentId], (countErr, countResult) => {
        if (countErr) {
            console.error(countErr);
            return res.status(500).json({ message: "Failed to validate department" });
        }

        const totalStudents = countResult.rows[0]?.total ?? 0;
        if (totalStudents > 0) {
            return res.status(400).json({
                message: "Cannot delete department. There are students in this department."
            });
        }

        const deleteQuery = 'DELETE FROM "Emam".department WHERE department_id=$1';
        con.query(deleteQuery, [departmentId], (deleteErr, deleteResult) => {
            if (deleteErr) {
                console.error(deleteErr);
                return res.status(500).json({ message: "Failed to delete department" });
            }

            if (deleteResult.rowCount === 0) {
                return res.status(404).json({ message: "Department not found" });
            }

            return res.status(200).json({ message: "Department deleted successfully" });
        });
    });
});

const PORT= 3000;

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});