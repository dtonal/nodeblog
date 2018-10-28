var express 	= require("express"),
	app 		= express(),
	mongoose	= require("mongoose"),
methodOverride  = require("method-override"),
	bdyPrser	= require("body-parser"),
	sanitizer   = require("express-sanitizer");


// Setup app
app.use(bdyPrser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(sanitizer());

// Connect Mongodb
mongoose.connect("mongodb://localhost/blog", { useNewUrlParser: true })

var Schema = mongoose.Schema;

var blogSchema = new Schema({
  title:  String,
  body:   String,
  date: { type: Date, default: Date.now },
  img: String
});

var BlogModel = mongoose.model("blog", blogSchema);

app.get("/", function(request, response){
	response.redirect("/blogs");
})


app.get("/blogs", function(request, response){
	BlogModel.find({}, function(err, blogs){
		if(err){
			console.log("Hups, error:" + err);
		}else{
			response.render("index", { blogs: blogs});
		}
	})

})

// new
app.get("/blogs/new", function(request, response){
	response.render("new");
})

// create
app.post("/blogs", function(req, res){
	var sanitized = req.sanitize(req.body.blog.body);
	// adding blog
	BlogModel.create({
		title: req.body.blog.title,
		img: req.body.blog.img,
		body: sanitized
	}, function (error, blog){
		if(error){
			console.log(error);
		}else{
			console.log("new blog added");
			console.log(blog);
			// redirect to blogs
			res.redirect("/blogs");
		}
	});
});

// show
app.get("/blogs/:id", function (req, res){
	BlogModel.findById(req.params.id, function(error, blogFromDb){
		if(error){
			console.log(error);
			res.redirect("/blogs");
		}else{
			 res.render("show" , {blog: blogFromDb});
		}
	});
});

// edit
app.get("/blogs/:id/edit", function (req, res){
		BlogModel.findById(req.params.id, function(error, blogFromDb){
		if(error){
			console.log(error);
			res.redirect("/blogs");
		}else{
			 res.render("edit" , {blog: blogFromDb});
		}
	});
});

app.put("/blogs/:id", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	BlogModel.findByIdAndUpdate(req.params.id, req.body.blog ,function(error, updatedBlog){
		if(error){
			console.log(error);
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs/"+updatedBlog._id);
		}
	});
})

app.delete("/blogs/:id", function(req, res){
	BlogModel.findByIdAndDelete(req.params.id, function(error, updatedBlog){
		if(error){
			console.log(error);
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs");
		}
	});
});

app.get("*", function(request, response){
	response.send(" not found");
});


app.listen(4000);