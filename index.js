const express = require('express');
const app = express();
const PORT = 8080;




app.use(express.json());

app.get('/config', (req,res) => {

    res.status(200).send({
        config:'A',
    })
})

app.post('/stats/:id', (req,res) => {

    const { id } = req.params;
    const { logo } = req.body;


    res.send({
        "stats":"gotten",
        "data":`${id} with ${logo}`
    })
})


app.listen(PORT, () => console.log(`server hosting on http://localhost:${PORT}`));