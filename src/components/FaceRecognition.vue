<template>
  <!-- 🏠 Intro Section -->
  <div class="intro-container">
    <h1 class="intro-title">Welcome to My Face Detection App! 👋</h1>
    <p class="intro-text">
      This is an AI-powered face detection app built with Vue.js & Face-api.js.  
      Upload an image, and the app will detect faces instantly!  
    </p>
    <p class="intro-text">
      I'm Miriam Araújo, a passionate web developer focused on JavaScript, Vue.js, and AI applications.  
    </p>
  </div>

  <!-- 🏠 Face Detection App -->
  <div class="face-recognition-container">
    <h2 class="title">Face Detection</h2>

    <!-- Upload & Clear Button (Aligned) -->
    <div class="button-group">
      <FileUpload
        mode="basic"
        @select="onFileSelect"
        customUpload
        auto
        class="custom-btn upload-btn"
      >
        <i class="pi pi-upload"></i> Upload Image
      </FileUpload>

      <button v-if="src" class="custom-btn clear-btn" @click="clearImage">
        <i class="pi pi-trash"></i> Clear Image
      </button>
    </div>

    <!-- Image Preview & Canvas -->
    <div class="image-preview-container" v-if="src">
      <div class="canvas-wrapper">
        <img
          ref="imageRef"
          v-if="src"
          :src="src"
          alt="Uploaded Image"
          class="image-preview fade-in"
          @load="detectFaces"
        />
        <canvas ref="canvasRef" class="canvas-overlay"></canvas>
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
          🟢 Detected Faces: {{ faceCount }}
        </span>
        <span v-else-if="faceCount === 0" class="text-red-500">
          🔴 No Faces Detected
        </span>
        <span v-else> ⏳ Waiting for image...</span>
      </p>
    </div>
  </div>

  <!-- 📞 Discrete Footer -->
  <footer class="footer">
    <p>🔗 Connect with me:</p>
    <div class="social-links">
      <a href="https://github.com/miriam-araujo" target="_blank"><i class="pi pi-github"></i> GitHub</a>
      <a href="https://www.linkedin.com/in/miriam-araujo" target="_blank"><i class="pi pi-linkedin"></i> LinkedIn</a>
      <a href="https://codepen.io/miriam-araujo" target="_blank"><i class="pi pi-codepen"></i> CodePen</a>
    </div>
  </footer>
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
/* 🏠 Intro Section */
.intro-container {
  text-align: center;
  max-width: 700px;
  margin: 15px auto;
  padding: 10px;
}

.intro-title {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.intro-text {
  font-size: 15px;
  color: #555;
  line-height: 1.5;
}

/* ✅ Buttons (Aligned) */
.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 10px;
}

.custom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease-in-out;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
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
}

.clear-btn:hover {
  background-color: #d32f2f;
  transform: scale(1.05);
}

/* ✅ Compact Image & Canvas */
.image-preview {
  width: 180px;
  height: 180px;
  border-radius: 8px;
  box-shadow: 0px 3px 7px rgba(0, 0, 0, 0.15);
}

.canvas-wrapper {
  position: relative;
  display: inline-block;
}

.canvas-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 180px;
  height: 180px;
}

/* 📞 Compact Footer */
.footer {
  width: 100%;
  background: #f9f9f9;
  color: #444;
  text-align: center;
  padding: 6px 0;
  font-size: 12px;
  margin-top: 15px;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.social-links a {
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s ease-in-out;
}

.social-links a:hover {
  color: #0056b3;
}
</style>
