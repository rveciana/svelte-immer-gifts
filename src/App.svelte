<script>
  import "./patch-process";
  import {
    getInitialState,
    getBookDetails,
    giftsReducer,
    patchGeneratingGiftsReducer
  } from "./www";
  import Gift from "./Gift.svelte";
  import { onMount } from "svelte";
  import uuidv4 from "uuid/v4";
  import { enablePatches } from "immer";
  enablePatches();

  let state = getInitialState();
  let undoStackPointer = -1;
  let undoStack = [];
  let socket;
  $: currentUser = state.currentUser;
  $: gifts = state.gifts;
  $: users = state.users;

  onMount(async () => {
    const url = "ws://localhost:5001";
    socket = new WebSocket(url);

    socket.onmessage = event => {
      const patches = JSON.parse(event.data);
      state = giftsReducer(state, { type: "APPLY_PATCHES", patches });
    };
    console.log("created socket to " + url);
    return () => {
      console.log("socket disconnected");
      socket.close();
    };
  });

  const dispatch = (action, undoable = true) => {
    const [nextState, patches, inversePatches] = patchGeneratingGiftsReducer(state, action);
    socket.send(JSON.stringify(patches));

    if (undoable) {
      const pointer = ++undoStackPointer;
      undoStack.length = pointer;
      undoStack[pointer] = { patches, inversePatches };
    }
    state = nextState;
  };

  const handleAdd = () => {
    const description = prompt("Gift to add");
    if (description)
      dispatch({
        type: "ADD_GIFT",
        id: uuidv4(),
        description,
        image: `https://picsum.photos/id/${Math.round(Math.random() * 1000)}/200/200`
      });
  };

  const handleReserve = id => {
    dispatch({
      type: "TOGGLE_RESERVATION",
      id
    });
  };

  const handleReset = () => {
    dispatch({ type: "RESET" });
  };

  const handleAddBook = async () => {
    const isbn = prompt("Enter ISBN number", "0201558025");
    if (isbn) {
      const book = await getBookDetails(isbn);
      dispatch({
        type: "ADD_BOOK",
        book
      });
    }
  };

  const handleUndo = () => {
    if (undoStackPointer < 0) return;
    const patches = undoStack[undoStackPointer].inversePatches;
    dispatch({ type: "APPLY_PATCHES", patches }, false);
    undoStackPointer--;
  };

  const handleRedo = () => {
    if (undoStackPointer === undoStack.length - 1) return;
    undoStackPointer++;
    const patches = undoStack[undoStackPointer].patches;
    dispatch({ type: "APPLY_PATCHES", patches }, false);
  };
</script>

<div class="app">
  <div class="header">
    <h1>Hi, {currentUser.name}</h1>
  </div>
  <div class="actions">
    <button on:click={handleAdd}>Add</button>
    <button on:click={handleAddBook}>Add Book</button>
    <button on:click={handleReset}>Reset</button>
    <button on:click={handleUndo}> Undo </button>
    <button on:click={handleRedo}> Redo </button>
  </div>

  <div class="gifsts">
    {#each gifts as gift}
      <Gift {gift} {users} {currentUser} onReserve={handleReserve} />
    {/each}
  </div>
</div>

<style>
  .actions {
    padding: 8px 0;
    margin-bottom: 20px;
    border-bottom: 1px dashed orangered;
    border-top: 1px dashed orangered;
  }

  .actions button {
    margin-right: 8px;
  }

  button {
    cursor: pointer;
    font-size: 14pt;
    padding: 4px 8px;
  }
</style>
