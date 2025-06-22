import React from 'react';
import { createRoot } from 'react-dom/client';
import { App, Nav } from './App'; // Assicurati che App.js esporti sia App che Nav

import './index.css';

// Ottieni i riferimenti ai tuoi contenitori HTML
const appContainer = document.getElementById('root');
const navContainer = document.getElementById('nav-container');

// Crea una root React separata per ogni contenitore
const appRoot = createRoot(appContainer);
const navRoot = createRoot(navContainer);

// Renderizza i tuoi componenti nelle rispettive root
appRoot.render(<App />);
navRoot.render(<Nav />);