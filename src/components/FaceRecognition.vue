<template>
  <div class="face-recognition-container">
    <h2 class="title">Face Detection</h2>

    <!-- Upload Button -->
    <div class="upload-container">
      <FileUpload
        mode="basic"
        @select="onFileSelect"
        customUpload
        auto
        class="custom-btn upload-btn"
      >
        <i class="pi pi-upload"></i> Upload Image
      </FileUpload>
    </div>

    <!-- Image Preview & Canvas -->
    <div class="image-preview-container" v-if="src">
      <div class="canvas-wrapper">
        <!-- The fade-in effect is applied via the "fade-in" class -->
        <img
          ref="imageRef"
          v-if="src"
          :src="src"
          alt="Uploaded Image"
          class="image-preview fade-in"
          @load="detectFaces"
        />
        <canvas ref="canvasRef"></canvas>
      </div>
    </div>

    <!-- Status (Face Count / Loading) -->
    <div class="status-container">
      <div v-if="loading" class="loading-spinner">
        <div class="spinner"></div>
        <p>Detecting Faces...</p>
      </div>

      <p class="face-count">
        <span v-if="faceCount !== null && faceCount > 0" class="text-green-500">
          🟢 Detected Faces: {{ faceCount }}</span
        >
        <span v-else-if="faceCount === 0" class="text-red-500">
          🔴 No Faces Detected</span
        >
        <span v-else> ⏳ Waiting for image...</span>
      </p>
    </div>

    <div class="button-container">
      <button v-if="src" class="custom-btn clear-btn" @click="clearImage">
        <i class="pi pi-trash"></i> Clear Image
      </button>
    </div>
  </div>
</template>

<script>
import FileUpload from "primevue/fileupload";
import "primeicons/primeicons.css"; 
import * as faceapi from "face-api.js";
import "face-api.js/dist/face-api";

export default {
  components: { FileUpload },
  data() {
    return {
      faceCount: null,
      loading: false,
      src: null,
    };
  },
  async mounted() {
    await this.loadModels();
  },
  methods: {
    async loadModels() {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      } catch (error) {
        console.error("❌ Error loading Face-api.js models", error);
      }
    },

    onFileSelect(event) {
      const file = event.files[0];
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (this.src) {
          URL.revokeObjectURL(this.src);
        }
        this.src = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    async detectFaces() {
      if (!this.src) return;
      this.loading = true;
      this.faceCount = null;
      await this.$nextTick();
      const image = this.$refs.imageRef;
      const canvas = this.$refs.canvasRef;
      const displaySize = { width: image.width, height: image.height };
      canvas.width = displaySize.width;
      canvas.height = displaySize.height;
      try {
        const detections = await faceapi.detectAllFaces(
          image,
          new faceapi.TinyFaceDetectorOptions()
        );
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        resizedDetections.forEach((detection) => {
          const box = detection.box;
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.strokeRect(box.x, box.y, box.width, box.height);
        });
        this.faceCount = resizedDetections.length;
      } catch (error) {
        console.error("❌ Error detecting faces:", error);
      }
      this.loading = false;
    },

    clearImage() {
      if (this.src) {
        URL.revokeObjectURL(this.src);
      }
      this.src = null;
      this.faceCount = null;
    },
  },
};
</script>

<style scoped>
.face-recognition-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 75vh;
  text-align: center;
  background: #f9f9f9;
  padding-top: 5px;
}

.title {
  font-size: 18px;
  margin-bottom: 5px;
}

.upload-container {
  margin-bottom: 15px;
}

.custom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 13px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease-in-out;
  box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.1);
}

.upload-btn {
  background-color: #007bff;
  color: white;
}

.upload-btn:hover {
  background-color: #0056b3;
  transform: scale(1.05);
}

.clear-btn {
  background-color: #ff4c4c;
  color: white;
  margin-top: 5px;
}

.clear-btn:hover {
  background-color: #d32f2f;
  transform: scale(1.05);
}

.image-preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 5px;
}

.canvas-wrapper {
  position: relative;
  display: inline-block;
}

.image-preview {
  width: 190px;
  height: 190px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  opacity: 0; 
  animation: fadeIn 0.8s ease-in-out forwards; /* Smooth fade-in */
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 190px;
  height: 190px;
}

.status-container {
  margin-top: 4px;
}

.face-count {
  font-size: 14px;
  font-weight: bold;
  color: #28a745;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
