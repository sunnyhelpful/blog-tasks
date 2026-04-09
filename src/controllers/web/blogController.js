const { isValidObjectId } = require("mongoose");
const Blog = require("../../models/blog");

async function index(req, res) {
  try {
    if (!req.xhr && !req.headers.accept.includes("json")) {
      return res.render("web/blogs/index", {
        layout: 'layouts/webLayout',
        title: 'ProConnect - Professional Network'
      });
    }

    let { offset = 0, limit = 10 } = req.query;

    offset = parseInt(offset);
    limit = parseInt(limit);

    if (offset < 0) offset = 0;
    if (limit <= 0 || limit > 100) limit = 10;

    const blogs = await Blog.find({})
      .populate("blogImages")
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Blog.countDocuments();

    return res.json({
      success: true,
      data: blogs,
      meta: {
        total,
        offset,
        limit,
        count: blogs.length,
      },
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);

    return res.status(500).json({ status: false, message: error.message });
  }
}

async function getFeedBlogs(req, res) {
  try {
    let { offset = 0, limit = 10 } = req.query;

    offset = parseInt(offset);
    limit = parseInt(limit);

    if (offset < 0) offset = 0;
    if (limit <= 0 || limit > 100) limit = 10;

    const blogs = await Blog.find({})
      .populate("blogImages")
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Blog.countDocuments();

    // Random names for users and companies
    const firstNames = ['Steven', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Lisa', 'Robert', 'Maria', 'John', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'William'];
    const lastNames = ['Roberts', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore'];
    const companyPrefixes = ['Castrosasz', 'Global', 'Tech', 'Digital', 'Future', 'Innovative', 'Modern', 'Elite', 'Prime', 'Vision'];
    const companySuffixes = ['Convertiblessd', 'Solutions', 'Technologies', 'Enterprises', 'Group', 'Industries', 'Systems', 'Dynamics', 'Ventures', 'Labs'];
    const jobTitles = ['Senior Product Manager', 'Full-Stack Developer', 'UX Designer', 'Data Scientist', 'DevOps Engineer', 'Product Owner', 'Tech Lead', 'Software Architect', 'Frontend Developer', 'Backend Developer'];

    const getRandomName = () => {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const middleInitial = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      return { firstName, lastName, middleInitial };
    };

    const getRandomCompany = () => {
      const prefix = companyPrefixes[Math.floor(Math.random() * companyPrefixes.length)];
      const suffix = companySuffixes[Math.floor(Math.random() * companySuffixes.length)];
      return `${prefix} ${suffix} Pvt Ltd`;
    };

    const getRandomJobTitle = () => {
      return jobTitles[Math.floor(Math.random() * jobTitles.length)];
    };

    const getRandomFollowers = () => {
      return Math.floor(Math.random() * (50000 - 1000 + 1) + 1000).toLocaleString();
    };

    const getRandomTimeAgo = () => {
      const times = ['2h', '4h', '6h', '8h', '12h', '1d', '2d', '3d', '5d', '1w'];
      return times[Math.floor(Math.random() * times.length)];
    };

    const getRandomInitials = (firstName, lastName) => {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`;
    };

    const getRandomGradient = () => {
      const gradients = [
        'linear-gradient(135deg,#667eea,#764ba2)',
        'linear-gradient(135deg,#f093fb,#f5576c)',
        'linear-gradient(135deg,#4facfe,#00f2fe)',
        'linear-gradient(135deg,#43e97b,#38f9d7)',
        'linear-gradient(135deg,#fa709a,#fee140)',
        'linear-gradient(135deg,#a8edea,#fed6e3)',
        'linear-gradient(135deg,#ff9a9e,#fecfef)',
        'linear-gradient(135deg,#ffecd2,#fcb69f)'
      ];
      return gradients[Math.floor(Math.random() * gradients.length)];
    };

    const formattedBlogs = blogs.map(blog => {
      const { firstName, lastName, middleInitial } = getRandomName();
      const company = getRandomCompany();
      const jobTitle = getRandomJobTitle();
      const followers = getRandomFollowers();
      const timeAgo = getRandomTimeAgo();
      const initials = getRandomInitials(firstName, lastName);
      const gradient = getRandomGradient();
      const fullName = `${firstName} ${middleInitial}. ${lastName}`;

      return {
        ...blog.toObject(),
        author: {
          name: fullName,
          initials: initials,
          jobTitle: jobTitle,
          company: company,
          followers: followers,
          timeAgo: timeAgo,
          gradient: gradient
        }
      };
    });

    return res.json({
      success: true,
      data: formattedBlogs,
      meta: {
        total,
        offset,
        limit,
        count: formattedBlogs.length,
      },
    });
  } catch (error) {
    console.error("Error fetching feed blogs:", error);

    return res.status(500).json({ status: false, message: error.message });
  }
}

async function show(req, res) {
  try {
    const { slug } = req.params;
    
    const blog = await Blog.findOne({ slug: slug })
      .populate("blogImages");
    
    console.log("blog.. ", blog);
    
    if (!blog) {
      return res.status(404).render("common/pages/page-404", {
        layout: 'layouts/webLayout',
        title: 'Blog Not Found',
        message: 'The blog post you are looking for does not exist.'
      });
    }

    // Random author data for the blog detail page
    const firstNames = ['Steven', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Lisa', 'Robert', 'Maria', 'John', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'William'];
    const lastNames = ['Roberts', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore'];
    const companyPrefixes = ['Castrosasz', 'Global', 'Tech', 'Digital', 'Future', 'Innovative', 'Modern', 'Elite', 'Prime', 'Vision'];
    const companySuffixes = ['Convertiblessd', 'Solutions', 'Technologies', 'Enterprises', 'Group', 'Industries', 'Systems', 'Dynamics', 'Ventures', 'Labs'];
    const jobTitles = ['Senior Product Manager', 'Full-Stack Developer', 'UX Designer', 'Data Scientist', 'DevOps Engineer', 'Product Owner', 'Tech Lead', 'Software Architect', 'Frontend Developer', 'Backend Developer'];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const middleInitial = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const company = `${companyPrefixes[Math.floor(Math.random() * companyPrefixes.length)]} ${companySuffixes[Math.floor(Math.random() * companySuffixes.length)]} Pvt Ltd`;
    const jobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    const followers = Math.floor(Math.random() * (50000 - 1000 + 1) + 1000).toLocaleString();
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
    const fullName = `${firstName} ${middleInitial}. ${lastName}`;
    
    const gradients = [
      'linear-gradient(135deg,#667eea,#764ba2)',
      'linear-gradient(135deg,#f093fb,#f5576c)',
      'linear-gradient(135deg,#4facfe,#00f2fe)',
      'linear-gradient(135deg,#43e97b,#38f9d7)'
    ];
    const gradient = gradients[Math.floor(Math.random() * gradients.length)];

    const author = {
      name: fullName,
      initials: initials,
      jobTitle: jobTitle,
      company: company,
      followers: followers,
      gradient: gradient
    };

    return res.render("web/blogs/show", {
      layout: 'layouts/webLayout',
      title: blog.title,
      blog: blog,
      author: author
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return res.status(500).render("common/pages/page-500", {
      layout: 'layouts/webLayout',
      title: 'Server Error',
      message: 'Something went wrong. Please try again later.'
    });
  }
}

module.exports = {
  index,
  getFeedBlogs,
  show,
};