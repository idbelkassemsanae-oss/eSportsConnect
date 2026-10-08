// Affiche les ressources (PDF, images) d'un cours
import React, { useState, useEffect } from 'react';
import { ListGroup, Button, Form, Modal } from 'react-bootstrap';
import { getCourseResources, addCourseResource, deleteCourseResource } from '../services/courseService';
import { useAuth } from '../context/AuthContext';

const CourseResources = ({ courseId, isCoach }) => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResources();
  }, [courseId]);

  const fetchResources = async () => {
    try {
      const res = await getCourseResources(courseId);
      setResources(res.data.results || []);
    } catch (err) {
      console.error('Erreur chargement ressources:', err);
    }
  };

  const handleUpload = async () => {
    if (!file || !title) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('file', file);
      await addCourseResource(courseId, formData);
      setTitle('');
      setFile(null);
      setShowModal(false);
      fetchResources();
    } catch (err) {
      alert('Erreur lors de l\'upload');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resourceId) => {
    if (!window.confirm('Supprimer cette ressource ?')) return;
    try {
      await deleteCourseResource(courseId, resourceId);
      fetchResources();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div className="mt-3">
      <h5><i className="fas fa-paperclip me-2"></i>Ressources</h5>
      {isCoach && (
        <Button variant="primary" size="sm" className="mb-2" onClick={() => setShowModal(true)}>
          <i className="fas fa-upload me-1"></i>Ajouter une ressource
        </Button>
      )}
      <ListGroup>
        {resources.map((r) => (
          <ListGroup.Item key={r.id} className="d-flex justify-content-between align-items-center">
            <a href={r.file_url} target="_blank" rel="noopener noreferrer">
              <i className="fas fa-file-pdf me-2"></i>{r.title}
            </a>
            <div>
              <span className="text-muted small me-2">{new Date(r.uploaded_at).toLocaleDateString()}</span>
              {isCoach && (
                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(r.id)}>
                  <i className="fas fa-trash"></i>
                </Button>
              )}
            </div>
          </ListGroup.Item>
        ))}
        {resources.length === 0 && <ListGroup.Item className="text-muted">Aucune ressource disponible.</ListGroup.Item>}
      </ListGroup>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>Ajouter une ressource</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Titre</Form.Label>
            <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Fichier</Form.Label>
            <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
          <Button variant="primary" onClick={handleUpload} disabled={loading}>
            {loading ? 'Envoi...' : 'Téléverser'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CourseResources;