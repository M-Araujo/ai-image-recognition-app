<template>
  <div class="app-container">
    <div class="intro-container fade-in">
      <h1 class="intro-title">Welcome to My Face Detection App! 👋</h1>
      <p class="intro-text">
        This is an AI-powered face detection app built with Vue.js & Face-api.js. Upload
        an image, and the app will detect faces instantly!
      </p>
      <p class="intro-text">
        I'm Miriam Araújo, a passionate web developer focused on JavaScript, Vue.js, and
        AI applications.
      </p>
    </div>

    <div class="face-recognition-container fade-in">
      <h2 class="title">Face Detection</h2>

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

    <footer class="footer fade-in">
      <p>🔗 Connect with me:</p>
      <div class="social-links">
        <a href="https://github.com/M-Araujo" target="_blank"
          ><i class="pi pi-github"></i> GitHub</a
        >
        <a href="https://www.linkedin.com/in/miriam-araujo-dev" target="_blank"
          ><i class="pi pi-linkedin"></i> LinkedIn</a
        >
        <a href="https://codepen.io/M-Araujo" target="_blank"
          ><i class="pi pi-codepen"></i> CodePen</a
        >
      </div>
    </footer>
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

      try {
        const image = this.$refs.imageRef;
        const canvas = this.$refs.canvasRef;

        console.log("🖼️ Image loaded:", image);

        if (!image) {
          console.error("❌ Image reference is missing");
          this.loading = false;
          return;
        }

        if (!canvas) {
          console.error("❌ Canvas reference is missing");
          this.loading = false;
          return;
        }

        const displaySize = { width: image.width, height: image.height };
        canvas.width = displaySize.width;
        canvas.height = displaySize.height;

        // ✅ Detect faces
        const detections = await faceapi.detectAllFaces(
          image,
          new faceapi.TinyFaceDetectorOptions()
        );

        console.log("🎯 Detections:", detections);

        // ✅ Move face detection check BEFORE using detections
        if (!detections || detections.length === 0) {
          console.warn("⚠️ No faces detected!");
          this.faceCount = 0;
          this.loading = false;
          return;
        }

        // ✅ Resize detections
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const ctx = canvas.getContext("2d");

        console.log("🎨 Drawing boxes on canvas...");

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        resizedDetections.forEach((detection) => {
          const box = detection.box;
          console.log("🖍️ Drawing box at:", box.x, box.y, box.width, box.height);
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.strokeRect(box.x, box.y, box.width, box.height);
        });

        // ✅ Set correct face count
        this.faceCount = resizedDetections.length;
      } catch (error) {
        console.error("❌ Face detection failed:", error);
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
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.intro-container {
  text-align: center;
  max-width: 700px;
  margin: 20px auto;
  padding: 10px;
}

.intro-title {
  font-size: 22px;
  font-weight: bold;
}

.intro-text {
  font-size: 15px;
  color: #555;
  line-height: 1.5;
}

.canvas-wrapper {
  position: relative;
  display: inline-block;
}

.image-preview {
  width: 200px;
  height: 200px;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0px 3px 7px rgba(0, 0, 0, 0.15);
}

.canvas-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 200px;
  height: 200px;
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 10px;
}

.custom-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease-in-out;
}

.upload-btn {
  background-color: #007bff;
  color: white;
}

.clear-btn {
  background-color: #ff4c4c;
  color: white;
}

.clear-btn:hover,
.upload-btn:hover {
  transform: scale(1.05);
}

.footer {
  width: 100%;
  background: #2c3e50;
  color: white;
  text-align: center;
  padding: 15px 0;
  margin-top: auto;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.fade-in {
  opacity: 0;
  animation: fadeIn 0.8s ease-in-out forwards;
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
</style>
