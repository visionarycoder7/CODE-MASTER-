/**
 * app.js
 * Main application coordinator:
 * - Orchestrates problem state, trace generation, visualizer, and editor.
 * - Handles playback controls, custom inputs, speed adjustments, and shortcuts.
 */

class App {
  constructor() {
    this.currentProblem = window.PROBLEM_CATALOG[0];
    this.currentInput = this.currentProblem.defaultInput;
    this.traceData = null;
    this.currentStepIdx = 0;
    this.isPlaying = false;
    this.playTimer = null;
    this.playSpeed = 1000; // ms per step
    this.mode = "walkthrough"; // "walkthrough" or "typewriter"

    // Instantiate sub-engines
    this.visualizer = new VisualizerEngine();
    this.editor = new CodeEditor(this);

    // UI elements
    this.btnPlay = document.getElementById("btn-play");
    this.playIcon = document.getElementById("play-icon");
    this.pauseIcon = document.getElementById("pause-icon");
    this.btnNext = document.getElementById("btn-next");
    this.btnPrev = document.getElementById("btn-prev");
    this.btnReset = document.getElementById("btn-reset");
    this.stepCurrentText = document.getElementById("step-current");
    this.stepTotalText = document.getElementById("step-total");
    this.progressFill = document.getElementById("progress-fill");
    this.progressContainer = document.getElementById("progress-container");
    this.speedSelect = document.getElementById("speed-select");

    this.inputField = document.getElementById("test-string-input");
    this.btnApplyInput = document.getElementById("btn-apply-input");

    this.btnPhase1 = document.getElementById("btn-phase-1");
    this.btnPhase2 = document.getElementById("btn-phase-2");

    this.btnModeWalkthrough = document.getElementById("mode-walkthrough");
    this.btnModeTypewriter = document.getElementById("mode-typewriter");

    this.problemSelect = document.getElementById("problem-select");

    this.init();
  }

  init() {
    // Render initial problem code in editor
    this.editor.renderCode(this.currentProblem);

    // Generate initial trace
    this.loadInput(this.currentInput);

    // Bind event listeners
    this.bindEvents();
  }

  loadInput(s) {
    this.pause();
    this.currentInput = s || "back(aps)ce";
    this.inputField.value = this.currentInput;

    // Generate full execution trace for this problem & input
    this.traceData = this.currentProblem.generateTrace(this.currentInput);
    this.currentStepIdx = 0;
    this.stepTotalText.textContent = this.traceData.steps.length - 1;

    this.renderCurrentStep();
  }

  bindEvents() {
    // Play / Pause
    this.btnPlay.addEventListener("click", () => this.togglePlay());
    this.btnNext.addEventListener("click", () => this.stepNext());
    this.btnPrev.addEventListener("click", () => this.stepPrev());
    this.btnReset.addEventListener("click", () => this.reset());

    // Speed
    this.speedSelect.addEventListener("change", (e) => {
      this.playSpeed = parseInt(e.target.value, 10);
      if (this.isPlaying) {
        this.pause();
        this.play();
      }
    });

    // Progress bar scrub
    this.progressContainer.addEventListener("click", (e) => {
      const rect = this.progressContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      const targetStep = Math.round(ratio * (this.traceData.steps.length - 1));
      this.goToStep(targetStep);
    });

    // Custom test input apply
    this.btnApplyInput.addEventListener("click", () => {
      const val = this.inputField.value.trim();
      if (val) this.loadInput(val);
    });
    this.inputField.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const val = this.inputField.value.trim();
        if (val) this.loadInput(val);
      }
    });

    // Test Presets
    document.querySelectorAll(".preset-tag").forEach(tag => {
      tag.addEventListener("click", () => {
        document.querySelectorAll(".preset-tag").forEach(t => t.classList.remove("active-preset"));
        tag.classList.add("active-preset");
        const str = tag.getAttribute("data-str");
        this.loadInput(str);
      });
    });

    // Phase jump buttons
    this.btnPhase1.addEventListener("click", () => {
      this.goToStep(0);
    });
    this.btnPhase2.addEventListener("click", () => {
      // Find first step of phase 2
      const p2Idx = this.traceData.steps.findIndex(s => s.phase === 2);
      if (p2Idx !== -1) {
        this.goToStep(p2Idx);
      }
    });

    // Mode Toggle
    this.btnModeWalkthrough.addEventListener("click", () => {
      this.setMode("walkthrough");
    });
    this.btnModeTypewriter.addEventListener("click", () => {
      this.setMode("typewriter");
    });

    // Keyboard Shortcuts
    window.addEventListener("keydown", (e) => {
      // Ignore if typing inside input or textarea
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        this.togglePlay();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        this.stepNext();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        this.stepPrev();
      } else if (e.key === "r" || e.key === "R") {
        this.reset();
      }
    });
  }

  setMode(newMode) {
    this.mode = newMode;
    if (newMode === "typewriter") {
      this.pause();
      this.btnModeWalkthrough.classList.remove("active");
      this.btnModeTypewriter.classList.add("active");
      this.editor.setMode("typewriter");
    } else {
      this.btnModeTypewriter.classList.remove("active");
      this.btnModeWalkthrough.classList.add("active");
      this.editor.setMode("walkthrough");
      this.renderCurrentStep();
    }
  }

  renderCurrentStep() {
    if (!this.traceData || !this.traceData.steps) return;
    const step = this.traceData.steps[this.currentStepIdx];
    if (!step) return;

    // Update Progress bar & indicator
    this.stepCurrentText.textContent = `Step ${this.currentStepIdx}`;
    const pct = ((this.currentStepIdx / (this.traceData.steps.length - 1)) * 100).toFixed(1);
    this.progressFill.style.width = `${pct}%`;

    // Update Phase buttons
    if (step.phase === 1) {
      this.btnPhase1.classList.add("active");
      this.btnPhase2.classList.remove("active");
    } else {
      this.btnPhase2.classList.add("active");
      this.btnPhase1.classList.remove("active");
    }

    // Update Code line highlight in walkthrough
    this.editor.setActiveLine(step.lineNum);

    // Update Visualizer
    this.visualizer.renderStep(
      step, 
      this.currentInput, 
      this.currentProblem.syntaxExplanations
    );
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (this.currentStepIdx >= this.traceData.steps.length - 1) {
      this.currentStepIdx = 0;
    }
    this.isPlaying = true;
    this.playIcon.style.display = "none";
    this.pauseIcon.style.display = "block";

    this.playTimer = setInterval(() => {
      if (this.currentStepIdx < this.traceData.steps.length - 1) {
        this.currentStepIdx++;
        this.renderCurrentStep();
      } else {
        this.pause();
      }
    }, this.playSpeed);
  }

  pause() {
    this.isPlaying = false;
    this.playIcon.style.display = "block";
    this.pauseIcon.style.display = "none";
    if (this.playTimer) {
      clearInterval(this.playTimer);
      this.playTimer = null;
    }
  }

  stepNext() {
    this.pause();
    if (this.currentStepIdx < this.traceData.steps.length - 1) {
      this.currentStepIdx++;
      this.renderCurrentStep();
    }
  }

  stepPrev() {
    this.pause();
    if (this.currentStepIdx > 0) {
      this.currentStepIdx--;
      this.renderCurrentStep();
    }
  }

  reset() {
    this.pause();
    this.currentStepIdx = 0;
    this.renderCurrentStep();
  }

  goToStep(index) {
    this.pause();
    this.currentStepIdx = Math.max(0, Math.min(this.traceData.steps.length - 1, index));
    this.renderCurrentStep();
  }

  jumpToLine(lineNum) {
    this.pause();
    // Find nearest step that corresponds to this line
    const matchIdx = this.traceData.steps.findIndex(s => s.lineNum === lineNum);
    if (matchIdx !== -1) {
      this.goToStep(matchIdx);
    }
  }
}

// Boot application when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new App();
});
