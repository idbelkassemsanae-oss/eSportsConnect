import React, { useState, useEffect } from 'react';
import { ListGroup, Form, Button } from 'react-bootstrap';
import { getCourseComments, addCourseComment } from '../services/courseService';
import { useAuth } from '../context/AuthContext';

const CourseComments = ({ courseId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [courseId]);

  const fetchComments = async () => {
    try {
      const res = await getCourseComments(courseId);
      setComments(res.data.results || []);
    } catch (err) {
      console.error('Erreur chargement commentaires:', err);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    try {
      await addCourseComment(courseId, { content, parent_id: replyingTo });
      setContent('');
      setReplyingTo(null);
      fetchComments();
    } catch (err) {
      alert('Erreur lors de l\'envoi du commentaire');
    }
  };

  return (
    <div className="mt-4">
      <h5><i className="fas fa-comments me-2"></i>Questions et commentaires</h5>
      {user ? (
        <div className="mb-3">
          <Form.Control
            as="textarea"
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Posez une question ou laissez un commentaire..."
          />
          <Button variant="primary" size="sm" className="mt-1" onClick={handleSubmit}>
            Envoyer
          </Button>
        </div>
      ) : (
        <p className="text-muted">Connectez-vous pour commenter.</p>
      )}
      <ListGroup>
        {comments.map((c) => (
          <ListGroup.Item key={c.id}>
            <strong>{c.author}</strong> <span className="text-muted small">{new Date(c.created_at).toLocaleString()}</span>
            <p className="mb-1">{c.content}</p>
            <Button variant="link" size="sm" onClick={() => setReplyingTo(c.id)}>Répondre</Button>
            {c.replies && c.replies.map((r) => (
              <div key={r.id} className="ms-4 mt-2 border-start ps-3">
                <strong>{r.author}</strong> <span className="text-muted small">{new Date(r.created_at).toLocaleString()}</span>
                <p className="mb-1">{r.content}</p>
              </div>
            ))}
          </ListGroup.Item>
        ))}
        {comments.length === 0 && <ListGroup.Item className="text-muted">Aucun commentaire.</ListGroup.Item>}
      </ListGroup>
    </div>
  );
};

export default CourseComments;