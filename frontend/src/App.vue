<script setup>
import { ref } from 'vue'

const input = ref('')
const response = ref('')
const scripts = ref([])

async function sendToBackend() {
  
  const res = await fetch('http://127.0.0.1:8000/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text: input.value })
  })

  const data = await res.json()
  response.value = data.message
  input.value = ''

  
  const scriptsRes = await fetch(
    'http://127.0.0.1:8000/scripts'
  )
scripts.value = await scriptsRes.json()
}
</script>

<template>
  <div style="padding: 20px">
    <h2>Script Upload Test</h2>

    <textarea
     v-model="content" 
     placeholder="Place script here..."
    ></textarea>
    <button @click="sendToBackend">Send</button>

    <p>Backend response: {{ response }}</p>

    <h3>Scripts</h3>

    <ul>
      <li v-for="script in scripts" :key="script">
        {{ script }}
      </li>
    </ul>
  </div>
</template>