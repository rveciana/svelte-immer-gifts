<script>
  export let gift;
  export let users;
  export let currentUser;
  export let onReserve;
</script>

<div class={`gift ${gift.reservedBy ? "reserved" : ""}`}>
  <img src={gift.image} alt="gift" />
  <div class="description">
    <h2>{gift.description}</h2>
  </div>
  <div class="reservation">
    {#if !gift.reservedBy || gift.reservedBy === currentUser.id}
      <button on:click={() => onReserve(gift.id)}
        >{gift.reservedBy ? "Unreserve" : "Reserve"}</button
      >
    {:else}
      <span>{users[gift.reservedBy].name}</span>
    {/if}
  </div>
</div>

<style>
  .gift {
    border-radius: 4px;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 20px;
  }

  .gift img {
    height: 80px;
    width: 80px;
    object-fit: cover;
    border: 4px solid orange;
    border-radius: 80px;
  }

  .gift .description {
    text-align: center;
    flex-grow: 1;
  }

  .gift.reserved h2 {
    text-decoration: line-through;
    color: gray;
  }

  .gift .reservation {
    width: 120px;
    text-align: center;
  }

  .gift .reservation span {
    font-size: 30pt;
  }

  .gift .reservation span::before {
    content: "reserved by";
    font-size: 12pt;
    color: gray;
  }

  .gift .reservation button {
    margin-left: 8px;
  }
</style>
