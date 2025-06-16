const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

const {
  createBlog,
  getMyBlogs,
  updateBlogState,
  updateBlog,
  deleteBlog,
  getPublishedBlogs,     
  getBlogById           
} = require('../controllers/blogController');

router.get('/', getPublishedBlogs); 
router.get('/me', auth, getMyBlogs);        
router.get('/:id', getBlogById);            

router.post('/', auth, createBlog);                         
router.patch('/:id/publish', auth, updateBlogState); 
router.put('/:id', auth, updateBlog);            
router.delete('/:id', auth, deleteBlog);         

module.exports = router;

