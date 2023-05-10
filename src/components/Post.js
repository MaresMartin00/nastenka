import React, { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import './Post.css';

const Post = () => {
  const [postData, setPostData] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/posts')
      .then(response => response.json())
      .then(data => {

        fetch('https://jsonplaceholder.typicode.com/users')
          .then(response => response.json())
          .then(users => {
            const userDict = {};
            for (const user of users) {
              userDict[user.id] = user;
            }

            const newData = data.map(post => ({
              ...post,
              user: userDict[post.userId]
            }));

            Promise.all(
              newData.map(post => (
                fetch(`https://jsonplaceholder.typicode.com/comments?postId=${post.id}`)
                  .then(response => response.json())
                  .then(comments => ({
                    ...post,
                    comments: comments
                  }))
              ))
            ).then(posts => {
              setPostData(posts);
            });
          });
      });
  }, []);

  const handleClose = () => setSelectedPost(null);

  return (
    <div>
      {postData.map(post => (
        <Card className='Card' key={post.id} onClick={() => setSelectedPost(post)}>
          <Card.Body>
            <Card.Title>{post.title}</Card.Title>
            <Card.Subtitle className='mb-2 text-muted'>{post.user ? post.user.name : 'Unknown user'}</Card.Subtitle>
            <Card.Text>
              {post.body.slice(0, 100)}
              {selectedPost === post && post.body.slice(100)} 
              ... {/* Zobrazení tří teček za text*/}
            </Card.Text>
            <div className='postInfo'>
            <Card.Text>Show more ...</Card.Text>
            <Card.Text>Comments ({post.comments.length})</Card.Text>
            </div>
          </Card.Body>
        </Card>
      ))}
      {selectedPost && (
        <Modal dialogClassName='modalStyle' show={selectedPost !== null} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{selectedPost.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Card.Subtitle className='mb-2 text-muted'>{selectedPost.user ? selectedPost.user.name : 'Unknown user'}</Card.Subtitle>
            <Card.Text>{selectedPost.body}</Card.Text>
            <h5>Comments</h5>
            {selectedPost.comments.map(comment => (
              <Card className='Comment' key={comment.id}>
                <Card.Body>
                  <Card.Title>{comment.name}</Card.Title>
                  <Card.Subtitle className='mb-2 text-muted'>{comment.email}</Card.Subtitle>
                  <Card.Text>{comment.body}</Card.Text>
                </Card.Body>
              </Card>
            ))}
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default Post;
