<template>
  <div class="face-recognition-container">
    <h2>Face Detection</h2>

    <div class="card flex flex-col items-center gap-6">
      <FileUpload
        mode="basic"
        @select="onFileSelect"
        customUpload
        auto
        severity="secondary"
        class="p-button-outlined"
      />
    </div>

    <!-- Image Preview & Canvas -->
    <div class="image-container" v-if="src">
      <div class="preview-wrapper">
        <h3 class="preview-text">Preview:</h3>
        <div class="canvas-wrapper">
          <img
            ref="imageRef"
            v-if="src"
            :src="src"
            alt="Image"
            class="shadow-md rounded-xl w-full sm:w-64"
            @load="detectFaces"
          />
          <canvas ref="canvasRef"></canvas>
        </div>
      </div>
    </div>

    <!-- Loading Indicator -->
    <p v-if="loading">🔄 Detecting Faces...</p>

    <!-- Face Count -->
    <p v-if="faceCount !== null">🟢 Detected Faces: {{ faceCount }}</p>

    <!-- Clear Image Button -->
    <button v-if="src" class="clear-btn" @click="clearImage">❌ Clear Image</button>
  </div>
</template>

<script>
import FileUpload from "primevue/fileupload";
import * as faceapi from "face-api.js";
import "face-api.js/dist/face-api"; // ✅ Ensures all Face-api.js functions are available

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
        // ✅ Free memory if there's an existing image
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
      console.log("🚀 clearImage() function called!");

      if (this.src) {
        URL.revokeObjectURL(this.src); // ✅ Free memory
      }
      this.src = null;
      this.faceCount = null;
    },
  },
};
</script>

<style scoped>
.preview-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
}

.preview-text {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
  text-align: center;
}

.face-recognition-container {
  max-width: 800px;
  margin: 40px auto;
  text-align: center;
  background: #ffffff;
  padding: 20px;
}

.image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  width: 100%;
}

.canvas-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 90%;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
}

.image-container img {
  max-width: 90%;
  height: auto;
  display: block;
  border-radius: 8px;
}

canvas {
  max-width: 90%;
  height: auto;
  position: absolute;
  top: 0;
  left: 0;
}

.clear-btn {
  margin-top: 10px;
  padding: 8px 15px;
  background-color: #ff4c4c;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: 0.3s;
}

.clear-btn:hover {
  background-color: #d32f2f;
}
</style>
