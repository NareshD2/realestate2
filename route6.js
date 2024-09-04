const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { MongoClient, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');

// Cloudinary configuration
cloudinary.config({
    cloud_name: 'dmyrvncq8',
    api_key: '127992323956988',
    api_secret: 'WLynI5CD4DrDXVoYvHgBuVFGcLc',
});

// MongoDB configuration
const client1 = new MongoClient('mongodb+srv://garlapatidhatrinaresh:Supriya987@cluster0.wcqxqxj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
const dbName = 'credentials';
const usersCollection = client1.db(dbName).collection('users');
const productsenglish = client1.db(dbName).collection('productsenglish');
const adminCollection = client1.db(dbName).collection('admins');

// Storage configuration for images
const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'file-uploads/images',
        format: async () => 'png',
        public_id: (req, file) => `image_${uuidv4()}`,
        transformation: [{ width: 800, height: 600, crop: 'fill' }],
    },
});

// Storage configuration for videos
const videoStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'file-uploads/videos',
        format: async () => 'mp4',
        public_id: (req, file) => `video_${uuidv4()}`,
    },
});

const uploadImages = multer({ storage: imageStorage }).array('images[]', 20);
const uploadVideo = multer({ storage: videoStorage }).single('video');

// Express app setup
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
    cookie: { secure: false, maxAge: 60000 }, // For development; use true in production with HTTPS
}));

// Serve HTML files
const getHTMLFile = (fileName) => fs.readFileSync(path.join(__dirname, fileName), 'utf-8');

// Authentication middleware
const authenticate = (req, res, next) => {
    if (req.session && req.session.username) {
        return next();
    }
    res.redirect('/login.html');
};

const authenticateAdmin = (req, res, next) => {
    if (req.session && req.session.username1) {
        return next();
    }
    res.redirect('/admin.html');
};

// Serve HTML pages
app.get('/', (req, res) => {
    const userdata1 = req.cookies.user;
    if (userdata1) {
        const username3 = JSON.parse(userdata1).username;
        if (username3) {
            req.session.username = username3;
            return res.redirect('/products');
        }
    }
    res.send(getHTMLFile('login2.html'));
});

app.get('/login.html', (req, res) => res.send(getHTMLFile('login2.html')));
app.get('/signup.html', (req, res) => res.send(getHTMLFile('signup.html')));
app.get('/admin.html', (req, res) => res.send(getHTMLFile('admin.html')));
app.get('/adminsignup.html', (req, res) => res.send(getHTMLFile('adminsignup.html')));
app.get('/payment.html', (req, res) => res.send(getHTMLFile('payment.html')));
app.get('/additems.html', authenticateAdmin, (req, res) => res.send(getHTMLFile('additems.html')));
app.get('/paynow.html', (req, res) => res.send(getHTMLFile('trackorder.html')));

// Post routes
app.post('/additems.html', (req, res, next) => {
    uploadImages(req, res, (err) => {
        if (err) {
            return res.status(400).send('Error uploading images');
        }
        uploadVideo(req, res, async (err) => {
            if (err) {
                return res.status(400).send('Error uploading video');
            }

            try {
                const images = req.files['images[]'] ? req.files['images[]'].map(file => ({
                    url: file.path, // Cloudinary URL
                })) : [];

                const video = req.file ? req.file.path : null;

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
                    images: images,
                    video: video,
                };
                console.log('Data to be inserted:', JSON.stringify(data, null, 2));

                const result = await productsenglish.insertOne(data);
                const propertyId = result.insertedId;
                    const adminUsername = req.session.username1;
                    await adminCollection.updateOne(
                        { name: adminUsername },
                        { $push: { uploads: { id: propertyId } } }
                    );
                if (result.acknowledged) {
                    res.redirect('/');
                } else {
                    res.status(500).send('Error adding item to the database');
                }
            } catch (error) {
                console.error(error);
                res.status(500).send('An error occurred while adding the item');
            }
        });
    });
});

app.post('/signup', async (req, res) => {
    try {
        const check = await usersCollection.findOne({ name: req.body.username });
        if (check && check.password === req.body.password) {
            res.redirect('/signup.html?signupFailure=true');
        } else {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const data = {
                name: req.body.username,
                password: hashedPassword,
                phonenumber: req.body.phonenumber,
            };
            const result = await usersCollection.insertOne(data);
            console.log(result);
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
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const data = {
                name: req.body.username,
                password: hashedPassword,
                phonenumber: req.body.phonenumber,
            };
            const result = await adminCollection.insertOne(data);
            console.log(result);
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
                secure: false, // Set to true in production with HTTPS
                sameSite: 'Strict',
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
            res.redirect('/additems.html');
        } else {
            res.redirect('/admin.html?adminFailure=true');
        }
    } catch (error) {
        console.error(error);
        res.redirect('/admin.html?adminFailure=true');
    }
});

// Additional routes
app.get('/about', authenticate, (req, res) => res.send(getHTMLFile('index3.html').replace('{{%CONTENT%}}', 'You are in the About page')));
app.get('/contact', authenticate, (req, res) => res.send(getHTMLFile('index3.html').replace('{{%CONTENT%}}', 'You are in the Contact page')));

app.get('/products', authenticate, async (req, res) => {
    // Implement the logic for displaying products
    
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
