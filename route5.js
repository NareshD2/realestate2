const express = require('express');
const fs = require('fs');
const url = require('url');
const multer = require('multer');
const { MongoClient, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');

cloudinary.config({
    cloud_name: 'dmyrvncq8',
    api_key: '127992323956988',
    api_secret: 'WLynI5CD4DrDXVoYvHgBuVFGcLc',
});

const custommodule = require('./realprodcustom.js');
const custommodule2 = require('./raelsingleprodcustom.js');

const client1 = new MongoClient('mongodb+srv://garlapatidhatrinaresh:Supriya987@cluster0.wcqxqxj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
const usersCollection = client1.db('credentials').collection('users');
const productsenglish = client1.db('credentials').collection('productsenglish');
const adminCollection = client1.db('credentials').collection('admins');

// Storage configuration for images
const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "file-uploads/images",
        format: async (req, file) => "png", // Convert all images to png
        public_id: (req, file) => file.fieldname + "_" + Date.now(),
        transformation: [
            {
                width: 800,
                height: 600,
                crop: "fill",
            },
        ],
    },
});

// Storage configuration for videos
const videoStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "file-uploads/videos",
        format: async (req, file) => "mp4", // Convert all videos to mp4
        public_id: (req, file) => file.fieldname + "_" + Date.now(),
    },
});

const upload = multer({
    storage: imageStorage,
}).fields([{ name: 'images[]', maxCount: 20 }, { name: 'video', maxCount: 1 }]);

const connectToDatabase = async () => {
    try {
        await client1.connect();
        console.log('MongoDB connected');
    } catch (err) {
        console.error("Cannot connect to database", err);
        throw err; // Re-throw the error after logging
    }
};

connectToDatabase(); // Connect to database once at the start

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use(session({
    secret: '9618', // Replace with your own secret key
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 60000 } // For development; set to true in production with HTTPS
}));

const mainpage = fs.readFileSync('./homepage.html');
const payment = fs.readFileSync('./payment.html', 'utf-8');
const trackorder = fs.readFileSync('./trackorder.html', 'utf-8');
const html = fs.readFileSync('./index3.html', 'utf-8');
const html1 = fs.readFileSync('./index4.html', 'utf-8');
const producthtml = fs.readFileSync('./realestateproducts.html', 'utf-8');
const producthtml1 = fs.readFileSync('./realestateproducts1.html', 'utf-8');
const singleprodhtml = fs.readFileSync('./realestatesingleprod.html', 'utf-8');
const singleprodhtml1 = fs.readFileSync('./realsingleprod.html', 'utf-8');
const login = fs.readFileSync('./login2.html', 'utf-8');
const signup = fs.readFileSync('./signup.html', 'utf-8');
const adminhtml = fs.readFileSync('./admin.html', 'utf-8');
const adminsignuphtml = fs.readFileSync('./adminsignup.html', 'utf-8');
const additems = fs.readFileSync('./additems.html', 'utf-8');
const seller=fs.readFileSync('./sellaemain2.html','utf-8');

const authenticate = (req, res, next) => {
    if (req.session && req.session.username) {
        return next();
    } else {
        res.redirect('/login.html');
    }
};

const authenticate1 = (req, res, next) => {
    if (req.session && req.session.username1) {
        return next();
    } else {
        res.redirect('/admin.html');
    }
};

app.get('/', (req, res) => {
    const userdata1 = req.cookies.user;
    if (userdata1) {
        const username3 = JSON.parse(userdata1).username;
        if (username3) {
            req.session.username = username3;
            return res.redirect('/products');
        }
    }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.write(login);
    res.end();
});

app.get('/logout', (req, res) => {
    res.redirect('/login.html');
});

app.get('/login.html', (req, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.write(login);
    res.end();
});

app.get('/signup.html', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(signup);
    res.end();
});

app.get('/admin.html', (req, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.write(adminhtml);
    res.end();
});

app.get('/adminsignup.html', (req, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.write(adminsignuphtml);
    res.end();
});

app.get('/payment.html', (req, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.write(payment);
    res.end();
});

app.get('/sellerpage.html', authenticate1, (req, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.write(seller);
    //const admin = await adminCollection.findOne({ name: req.session.username1 });
    res.end();
});

app.get('/paynow.html', (req, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.write(trackorder);

    res.end();
});
app.get('/additems1.html',authenticate1,(req,res)=>{
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    res.write(html1.replace('{{%CONTENT%}}',additems));
    res.end();

});
app.post('/additems.html',authenticate1, upload, async (req, res) => {
    try {
        //console.log(JSON.p(req.files));
        //console.log(JSON.stringify(req.files, null, 2));

        if (!req.files || !req.files['images[]'] && !req.files['video']) {
            return res.status(400).send('No files uploaded');
        }

        const images1 = req.files['images[]'] ? req.files['images[]'].map(file => ({
            url: file.path, // Cloudinary URL
        })) : [];

        const video = req.files['video'];
        const admin = await adminCollection.findOne({ name: req.session.username1 });


        const data = {
            category: req.body.category,
            name: req.body.name,
            price: req.body.price,
            area: req.body.area,
            length: req.body.length,
            breadth: req.body.breadth,
            shape: req.body.shape,
            soilcolor: req.body.soilcolor,
            type1: req.body.type1,
            specifications: req.body.specifications,
            location: req.body.location,
            pincode: req.body.pincode,
            phonenumber: req.body.phonenumber,
            description: req.body.description,
            images: images1,
            video: video
        };
        

        const result = await productsenglish.insertOne(data);
        if (result.acknowledged) {
            const propertyId = result.insertedId;

            // Find the user by username and update their document to include the property ID
            const updatedAdmin = await adminCollection.findOne({ name: req.session.username1 });

            await adminCollection.updateOne(
                { name: req.session.username1 },
                { $addToSet: { propertyIds: propertyId } } // Add the property ID to the array, avoiding duplicates
            );
            res.status(200).json({ message: 'Property details added successfully!' });
        } else {
            res.status(500).send('Error adding item to the database');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while adding the item');
    }
});

app.post('/signup', async (req, res) => {
    try {
        const check = await usersCollection.findOne({ name: req.body.username });
        if (check && check.password === req.body.password) {
            res.redirect('/signup.html?signupFailure=true');
        } else {
            const hashedpassword = await bcrypt.hash(req.body.password, 10);
            const data = {
                name: req.body.username,
                password: hashedpassword,
                phonenumber: req.body.phonenumber
            };
            const temp = await usersCollection.insertOne(data);
            console.log(temp);
            res.redirect('/signup.html?signupSuccess=true');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred during signup');
    }
});

app.post('/adminsignup', async (req, res) => {
    try {
        const check = await adminCollection.findOne({ name: req.body.username });
        if (check && check.password === req.body.password) {
            res.redirect('/adminsignup.html?adminsignupFailure=true');
        } else {
            const hashedpassword = await bcrypt.hash(req.body.password, 10);
            const data = {
                name: req.body.username,
                password: hashedpassword,
                phonenumber: req.body.phonenumber
            };
            const temp = await adminCollection.insertOne(data);
            console.log(temp);
            res.redirect('/adminsignup.html?adminsignupSuccess=true');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred during admin signup');
    }
});

app.post('/login', async (req, res) => {
    try {
        const check = await usersCollection.findOne({ name: req.body.username });
        if (check && await bcrypt.compare(req.body.password, check.password)) {
            req.session.username = req.body.username;
            res.cookie('user', JSON.stringify(check), {
                maxAge: 900000,
                httpOnly: true,
                secure: false,
                sameSite: 'Strict'
            });
            res.redirect('/products');
        } else {
            res.redirect('/login.html?loginFailure=true');
        }
    } catch (error) {
        console.error(error);
        res.redirect('/login.html?loginFailure=true');
    }
});

app.post('/admin', async (req, res) => {
    try {
        const check = await adminCollection.findOne({ name: req.body.username });
        if (check && check.password === req.body.password) {
            req.session.username1 = req.body.username;
            res.redirect('/yourproducts');
            console.log(req.session.username1);
        } else {
            res.redirect('/admin.html?adminFailure=true');
        }
    } catch (error) {
        console.error(error);
        res.redirect('/admin.html?adminFailure=true');
    }
});

app.get('/about', authenticate, (req, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(html.replace('{{%CONTENT%}}', 'you are in About page'));
});

app.get('/contact', authenticate, (req, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(html.replace('{{%CONTENT%}}', 'you are in Contact page'));
});

app.get('/products', authenticate, async (req, res) => {
    try {
        let productjson = await productsenglish.find().toArray();
        let producthtmlArray = productjson.map(prod => custommodule.htmlreplace(producthtml, prod));

        if (!req.query.id) {
            res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
            res.end(html.replace('{{%CONTENT%}}', producthtmlArray.join('')));
        } else {
            let product = await productsenglish.findOne({ _id: new ObjectId(req.query.id) });
            let singleProdHtml = custommodule2.htmlreplace(singleprodhtml, product);
            res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
            res.end(html.replace('{{%CONTENT%}}', singleProdHtml));
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving products');
    }
});

app.get('/yourproducts', authenticate1,async (req, res) => {
    try {
        // Retrieve the user data from the adminCollection using the session's username
        let user = await adminCollection.findOne({ name: req.session.username1 });

        if (!user) {
            res.status(404).send('User not found');
            return;
        }

        // If there are no propertyIds for the user, return an appropriate message
        if (!user.propertyIds || user.propertyIds.length === 0) {
            res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
            res.end(html1.replace('{{%CONTENT%}}', '<p>No products found.</p>'));
            return;
        }

        // Fetch the products based on the propertyIds
        let products = await productsenglish.find({ _id: { $in: user.propertyIds.map(id => new ObjectId(id)) } }).toArray();
        let producthtmlArray = products.map(prod => custommodule.htmlreplace(producthtml1, prod));

        // If an ID is provided in the query, fetch and display that specific product
        if (!req.query.id) {
            res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
            res.end(html1.replace('{{%CONTENT%}}', producthtmlArray.join('')));
            
        } else {
            let product = await productsenglish.findOne({ _id: new ObjectId(req.query.id) });
            if (product) {
                let singleprodHtml1 = custommodule2.htmlreplace(singleprodhtml1, product);
                res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
                res.end(html1.replace('{{%CONTENT%}}', singleprodHtml1));
            } else {
                res.status(404).send('Product not found');
            }
            // Otherwise, display all products associated with the user
            
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving products');
    }
});



app.use((req, res) => {
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    res.end(html.replace('{{%CONTENT%}}', 'Page not found'));
});

const port = 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
