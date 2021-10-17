// import './patch-process';
import App from './App.svelte';
// import {enablePatches} from "immer";
// enablePatches();

const app = new App({
	target: document.body,
	
});

export default app;