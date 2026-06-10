<script setup>
import { ref } from 'vue'

const input = ref('')
const response = ref('')

async function sendToBackend() {
   console.log("Send button clicked")
  
  const res = await fetch('http://127.0.0.1:8000/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text: input.value })
  })

  const data = await res.json()
  response.value = data.received
}
</script>

<template>
  <div style="padding: 20px">
    <h2>Script Upload Test</h2>

    <input v-model="input" placeholder="Type something..." />
    <button @click="sendToBackend">Send</button>

    <p>Backend response: {{ response }}</p>
  </div>
</template>