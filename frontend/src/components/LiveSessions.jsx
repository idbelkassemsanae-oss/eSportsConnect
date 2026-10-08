import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { getLiveSessions } from '../services/courseService';

const LiveSessions = ({ courseId, isCoach }) => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchSessions();
  }, [courseId]);

  const fetchSessions = async () => {
    try {
      const res = await getLiveSessions(courseId);
      setSessions(res.data.results || []);
    } catch (err) {
      console.error('Erreur chargement sessions:', err);
    }
  };

  if (sessions.length === 0) return null;

  return (
    <div className="mt-3">
      <h5><i className="fas fa-video me-2"></i>Sessions en direct</h5>
      {sessions.map((s) => (
        <Card key={s.id} className="mb-2">
          <Card.Body>
            <Card.Title>{s.title}</Card.Title>
            <Card.Text>{s.description}</Card.Text>
            <Badge bg="danger">🔴 Live</Badge>
            <span className="ms-2 text-muted">
              {new Date(s.scheduled_at).toLocaleString()} ({s.duration} min)
            </span>
            <Button href={s.stream_url} target="_blank" variant="danger" size="sm" className="ms-2">
              <i className="fas fa-play me-1"></i>Regarder
            </Button>
            {isCoach && s.recorded_url && (
              <Button href={s.recorded_url} target="_blank" variant="secondary" size="sm" className="ms-1">
                <i className="fas fa-film me-1"></i>Replay
              </Button>
            )}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default LiveSessions;