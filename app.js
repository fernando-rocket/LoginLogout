const express = require('express')
const session = require('express-session')
const escapeHtml = require('escape-html')
const escapeHTML = require('escape-html')
const helmet = require('helmet')

const app = express()
const PORT = 3000

//MIDDLEWARE

app.use(express.urlencoded({ extended : true }))

app.use(
    helmet({
        contentSecurityPolicy:{
            directives:{
                defaultSrc: ["'self'"],//APENAS RECURSOS DO PRÓPRIO DOMÍNIO
                // scriptSrc: ["'self'"],//BLOQUEIA SCRIPTS INLINE E EXTERNOS
                scriptSrc: ["'self'", "'unsafe-inline'"],
                style: ["'self'", "'unsafe-inline'"],
                // styleSrc: ["'self'", "https://fonts.google.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
            }
        }
    })
)

app.use(session({
    secret: "minhafrasesecreta", //Mandar isso no dotenv
    resave: false,
    saveUninitialized: true,
    //rolling: false, //Renovar cada requisição
    cookie: {
        secure: false, // Em produção com https coloca 'true'
        maxAge: 60 * 1000
    }
}))

app.use(express.json())

app.get('/', (req, res)=> {
    res.sendFile("index.html", {root: __dirname })
})

app.get('/loginpage', (req, res) => {
    if(req.session.username){
        req.session.visitas = (req.session.visitas ?? 0) + 1 //Operador para o caso da variável não ter um valor, por mais que esteja declarada
        res.send(`Olá ${req.session.username}, você visitou essa página ${req.session.visitas} vezes.`)
    }
    else{
        res.sendFile('login.html', {root: __dirname })
        // res.send("Você visitou está página 1 vez, faça o login.")
    }
})

app.post('/loginsucess', (req, res)=>{
    console.log(req.body)
    const username = escapeHtml(req.body.username)
    const password = escapeHTML(req.body.password)
    console.log(username)
    if (username === "usuario" && password === "123"){
        req.session.username = username
        res.sendFile('login_sucess.html', {root: __dirname })
    }
    else{
        res.send("Credenciais inválidas.")
    }
})

app.get('/logoutpage', (req, res)=>{
    if (req.session.username){
        res.sendFile('logout.html', {root: __dirname })
    }
    else{
        res.send("Você não está logado.")
    }
})

app.get('/logout', (req, res)=>{
    req.session.destroy((err)=>{
        if(err){
            return res.send('Erro ao sair')
        }
        // res.send('Logout realizado!')
        res.sendFile('logout_sucess.html', {root: __dirname })
    })
})

//ROTA PARA VER O PERFIL SOMENTE LOGADO
app.get('/perfil', (req, res)=>{
    if(req.session.username){
        res.send(`Bem vindo ao seu perfil, ${req.session.username}`)
    }
    else{
        res.send('Você precisa estar logado para acessar o seu perfil')
    }
})

app.listen(PORT, ()=>{
    console.log(`Servidor rodando em: http://localhost:${PORT}`)
})