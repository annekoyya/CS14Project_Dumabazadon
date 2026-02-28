import { Inertia } from '@inertiajs/inertia';
import axios from 'axios';

// Axios setup for CSRF
axios.defaults.withCredentials = true;

// Inertia global setup (optional, ensures CSRF)
Inertia.defaults = {
  preserveState: true,
};