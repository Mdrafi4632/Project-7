// src/App.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient.js";
import "./App.css";

export default function App() {
  const [view, setView] = useState("add"); // 'add' | 'summary' | 'edit'
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState(null);

  // form state
  const [name, setName] = useState("");
  const [position, setPosition] = useState("Forward");
  const [club, setClub] = useState("");
  const [nationality, setNationality] = useState("");
  const [rating, setRating] = useState(75);

  // which player are we editing?
  const [editingPlayerId, setEditingPlayerId] = useState(null);

  useEffect(() => {
    if (view === "summary" || view === "edit") {
      loadSummary();
    } else {
      loadPlayers();
    }
  }, [view]);

  async function loadPlayers() {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("rating", { ascending: false });
    if (error) setError(error.message);
    else {
      setPlayers(data);
      setError(null);
    }
  }

  async function loadSummary() {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else {
      setPlayers(data);
      setError(null);
    }
  }

  // start editing: prefill form
  function startEditing(player) {
    setEditingPlayerId(player.id);
    setName(player.name);
    setPosition(player.position);
    setClub(player.club);
    setNationality(player.nationality);
    setRating(player.rating);
    setView("edit");
  }

  // clear form & editing state
  function clearForm() {
    setName("");
    setPosition("Forward");
    setClub("");
    setNationality("");
    setRating(75);
    setEditingPlayerId(null);
  }

  // create or update
  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { name, position, club, nationality, rating };

    let result, err;
    if (view === "add") {
      ({ data: result, error: err } = await supabase
        .from("players")
        .insert(payload)
        .select());
    } else {
      ({ data: result, error: err } = await supabase
        .from("players")
        .update(payload)
        .eq("id", editingPlayerId)
        .select());
    }

    if (err) {
      setError(err.message);
    } else {
      setError(null);
      clearForm();
      setView("summary");
    }
  }

  // delete handler
  async function handleDelete() {
    const { error } = await supabase
      .from("players")
      .delete()
      .eq("id", editingPlayerId);

    if (error) {
      setError(error.message);
    } else {
      setError(null);
      clearForm();
      setView("summary");
    }
  }

  return (
    <div className="App">
      <h1>Soccer Dream Team Builder</h1>

      <nav className="tabs">
        <button
          className={view === "add" ? "active" : ""}
          onClick={() => {
            clearForm();
            setView("add");
          }}
        >
          Add Crewmate
        </button>
        <button
          className={view !== "add" ? "active" : ""}
          onClick={() => {
            clearForm();
            setView("summary");
          }}
        >
          Summary
        </button>
      </nav>

      {error && <div className="error">{error}</div>}

      {(view === "add" || view === "edit") && (
        <section className="create-form">
          <h2>{view === "add" ? "Add a New Crewmate" : "Edit Crewmate"}</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Position</label>
              {["GK", "Defender", "Midfielder", "Forward"].map((pos) => (
                <button
                  key={pos}
                  type="button"
                  className={position === pos ? "selected" : ""}
                  onClick={() => setPosition(pos)}
                >
                  {pos}
                </button>
              ))}
            </div>

            <div>
              <label>Rating</label>
              <input
                type="number"
                min="0"
                max="100"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                required
              />
            </div>

            <div>
              <label>Club</label>
              <input
                type="text"
                value={club}
                onChange={(e) => setClub(e.target.value)}
              />
            </div>

            <div>
              <label>Nationality</label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                {view === "add" ? "Create" : "Update"} Crewmate
              </button>
              <button type="button" className="btn-submit" onClick={clearForm}>
                Clear
              </button>
              {view === "edit" && (
                <button
                  type="button"
                  className="btn-delete"
                  onClick={handleDelete}
                >
                  Delete Crewmate
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      {view === "summary" && (
        <section className="summary-page">
          <h2>All Crewmates</h2>
          {players.length === 0 ? (
            <p>No crewmates yet.</p>
          ) : (
            <ul className="player-list">
              {players.map((p) => (
                <li key={p.id} className="player-card">
                  <div className="info">
                    <strong>{p.name}</strong>
                    <p>
                      {p.position} • {p.club}
                    </p>
                    <p>⭐ {p.rating}</p>
                    <p>
                      <em>{p.nationality}</em>
                    </p>
                    <button
                      className="edit-btn"
                      onClick={() => startEditing(p)}
                    >
                      Edit
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
