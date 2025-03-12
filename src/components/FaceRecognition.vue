<template>
  <div class="face-recognition-container">
    <h2>Face Detection</h2>

    <div class="card-container">
      <div class="upload-container">
        <FileUpload
          mode="basic"
          @select="onFileSelect"
          customUpload
          auto
          severity="secondary"
          class="custom-upload-btn"
        />
      </div>

      <div class="image-preview-container" v-if="src">
        <div class="canvas-wrapper">
          <img
            ref="imageRef"
            v-if="src"
            :src="src"
            alt="Uploaded Image"
            class="image-preview"
            @load="detectFaces"
          />
          <canvas ref="canvasRef"></canvas>
        </div>
      </div>

      <div class="status-container">
        <div v-if="loading" class="loading-spinner">
          <div class="spinner"></div>
          <p>Detecting Faces...</p>
        </div>
        <p v-if="faceCount !== null" class="face-count">
          🟢 Detected Faces: {{ faceCount }}
        </p>
      </div>

      <button v-if="src" class="clear-btn" @click="clearImage">❌ Clear Image</button>
    </div>
  </div>
</template>

<script>
import FileUpload from "primevue/fileupload";
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
        console.log("✅ Face-api.js models loaded successfully");
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

      // ✅ Ensure canvas matches image size
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
          const { x, y, width, height } = detection.box;
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);
        });

        this.faceCount = resizedDetections.length;
      } catch (error) {
        console.error("❌ Error detecting faces:", error);
      }

      this.loading = false;
    },

    clearImage() {
      console.log("🚀 clearImage() function called!");

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
  height: 100vh;
  text-align: center;
  background: #f9f9f9;
}

.card-container {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 500px;
  text-align: center;
}


.upload-container {
  margin-bottom: 15px;
}

.custom-upload-btn {
  background-color: #007bff;
  color: white;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 16px;
  transition: 0.3s ease;
}

.custom-upload-btn:hover {
  background-color: #0056b3;
}


.image-preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
}


.canvas-wrapper {
  position: relative;
  display: inline-block;
}


.image-preview {
  width: 220px;
  height: 220px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 220px;
  height: 220px;
}

/* Status Container */
.status-container {
  margin-top: 10px;
}

/* Face Count */
.face-count {
  font-size: 18px;
  font-weight: bold;
  color: #28a745;
  margin-top: 10px;
}

/* Loading Spinner */
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.spinner {
  width: 25px;
  height: 25px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top-color: #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Clear Button */
.clear-btn {
  margin-top: 10px;
  padding: 8px 15px;
  background-color: #ff4c4c;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: 0.3s;
}

.clear-btn:hover {
  background-color: #d32f2f;
}
</style>
