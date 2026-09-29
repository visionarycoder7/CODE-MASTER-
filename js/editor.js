/**
 * editor.js
 * Controls the code editor view, syntax highlighting, active line indicators,
 * and the interactive "Write Syntax" playground mode.
 */

class CodeEditor {
  constructor(app) {
    this.app = app;
    this.walkthroughContainer = document.getElementById("editor-walkthrough-view");
    this.writerContainer = document.getElementById("editor-writer-view");
    this.lineNumbersEl = document.getElementById("line-numbers");
    this.codeContentEl = document.getElementById("code-content");

    // Writer Mode Elements
    this.syntaxInput = document.getElementById("syntax-type-input");
    this.targetSnippet = document.getElementById("writer-target-snippet");
    this.targetTitle = document.getElementById("writer-target-title");
    this.targetDesc = document.getElementById("writer-target-desc");
    this.btnQuickFill = document.getElementById("btn-quick-fill");

    this.writerChallenges = [
      {
        target: "stack = []",
        title: "Memory Allocation",
        desc: "Type 'stack = []' to see how Python initializes an empty dynamic list structure in memory.",
        match: /^\s*stack\s*=\s*\[\s*\]/i,
        syntaxKey: "stack = []",
        simulateAction: {
          phase: 1,
          syntaxKey: "stack = []",
          i: null,
          char: null,
          stackState: [],
          pairs: [],
          resultState: [],
          actionDesc: "stack = [] -> Memory container created. 0 elements allocated, ready for O(1) stack operations.",
          activeType: "init"
        }
      },
      {
        target: "for i, char in enumerate(s):",
        title: "Enumerate Iterator",
        desc: "Type 'for i, char in enumerate(s):' to see how Python iterates each character and assigns index 0, 1, 2...",
        match: /^\s*for\s+i\s*,\s*char\s+in\s+enumerate\s*\(\s*s\s*\)\s*:/i,
        syntaxKey: "for i, char in enumerate(s):",
        simulateAction: {
          phase: 1,
          syntaxKey: "for i, char in enumerate(s):",
          i: 2,
          char: "c",
          stackState: [],
          pairs: [],
          resultState: [],
          actionDesc: "for i, char in enumerate(s): -> Iterator produces tuple (2, 'c'). Automatically unpacked into i=2 and char='c'.",
          activeType: "iter"
        }
      },
      {
        target: "stack.append(i)",
        title: "Stack Push (LIFO)",
        desc: "Type 'stack.append(i)' to push an opening bracket '(' position onto the stack.",
        match: /^\s*stack\.append\s*\(\s*i\s*\)/i,
        syntaxKey: "stack.append(i)",
        simulateAction: {
          phase: 1,
          syntaxKey: "stack.append(i)",
          i: 4,
          char: "(",
          stackState: [4],
          pairs: [],
          resultState: [],
          actionDesc: "stack.append(4) -> Pushed open bracket index 4 onto the top of the stack.",
          activeType: "stack-push"
        }
      },
      {
        target: "opening_pos = stack.pop()",
        title: "Stack Pop (Matching Pair)",
        desc: "Type 'opening_pos = stack.pop()' to pop the most recent opening bracket when ')' is reached.",
        match: /^\s*opening_pos\s*=\s*stack\.pop\s*\(\s*\)/i,
        syntaxKey: "opening_pos = stack.pop()",
        simulateAction: {
          phase: 1,
          syntaxKey: "opening_pos = stack.pop()",
          i: 8,
          char: ")",
          poppedPos: 4,
          stackState: [],
          pairs: [{ open: 4, close: 8 }],
          resultState: [],
          actionDesc: "opening_pos = stack.pop() -> Popped index 4. Paired '(' at index 4 with ')' at index 8.",
          activeType: "stack-pop"
        }
      },
      {
        target: "close[\")\"][i] = opening_pos",
        title: "Two-Way Wormhole Dictionary",
        desc: "Type 'close[\")\"][i] = opening_pos' to save the matching indices into the hash table.",
        match: /^\s*close\s*\[\s*["']\)["']\s*\]\s*\[\s*i\s*\]\s*=\s*opening_pos/i,
        syntaxKey: "close[\")\"][i] = opening_pos",
        simulateAction: {
          phase: 1,
          syntaxKey: "close[\")\"][i] = opening_pos",
          i: 8,
          char: ")",
          stackState: [],
          pairs: [{ open: 4, close: 8 }],
          resultState: [],
          actionDesc: "close[')'][8] = 4 -> Mapped closing bracket index 8 to opening bracket index 4.",
          activeType: "pair-formed"
        }
      },
      {
        target: "traverse(s, -direction, jump_pos)",
        title: "Recursive Direction Inversion",
        desc: "Type recursive traverse with inverted direction to see characters reverse without reordering arrays!",
        match: /traverse/i,
        syntaxKey: "traverse(s, -direction, close[other_bracket][start] - direction)",
        simulateAction: {
          phase: 2,
          syntaxKey: "traverse(s, -direction, close[other_bracket][start] - direction)",
          i: 4,
          char: "(",
          direction: -1,
          teleportTo: 8,
          stackState: [],
          pairs: [{ open: 4, close: 8 }],
          resultState: ["b", "a", "c", "k", "s", "p", "a"],
          actionDesc: "traverse(-direction, ...) -> Teleported across wormhole to index 8 and reversed direction from right (+1) to left (-1)!",
          activeType: "teleport"
        }
      }
    ];

    this.currentChallengeIndex = 0;
    this.initWriterEvents();
  }

  /**
   * Sets up the interactive typing editor
   */
  initWriterEvents() {
    this.updateChallengeUI();

    this.syntaxInput.addEventListener("input", (e) => {
      this.handleSyntaxInput(e.target.value);
    });

    this.btnQuickFill.addEventListener("click", () => {
      const challenge = this.writerChallenges[this.currentChallengeIndex];
      this.syntaxInput.value = challenge.target;
      this.handleSyntaxInput(challenge.target);
    });

    // Chip quick try clicks
    document.querySelectorAll(".chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const snippet = chip.getAttribute("data-code");
        this.syntaxInput.value = snippet;
        this.handleSyntaxInput(snippet);
      });
    });
  }

  handleSyntaxInput(rawVal) {
    const val = rawVal.trim();
    if (!val) return;

    // Check if matches current challenge
    const challenge = this.writerChallenges[this.currentChallengeIndex];
    if (challenge.match.test(val)) {
      this.executeSyntaxAnimation(challenge.target, challenge);

      // Celebrate & advance after a short moment if matched
      this.targetSnippet.style.color = "var(--accent-emerald)";
      setTimeout(() => {
        this.currentChallengeIndex = (this.currentChallengeIndex + 1) % this.writerChallenges.length;
        this.updateChallengeUI();
      }, 2000);
      return;
    }

    // Otherwise check any challenge
    for (let c of this.writerChallenges) {
      if (c.match.test(val)) {
        this.executeSyntaxAnimation(c.target, c);
        return;
      }
    }
  }

  executeSyntaxAnimation(target, challenge) {
    if (this.animTimer) clearInterval(this.animTimer);

    const s = this.app.currentInput || "back(aps)ce";

    // SPECIAL ANIMATION 1: for i, char in enumerate(s):
    if (target.includes("enumerate")) {
      let stepIdx = 0;
      this.animTimer = setInterval(() => {
        if (stepIdx < s.length) {
          const char = s[stepIdx];
          this.app.visualizer.renderStep({
            phase: 1,
            syntaxKey: "for i, char in enumerate(s):",
            i: stepIdx,
            char: char,
            direction: 1,
            stackState: [],
            pairs: [],
            resultState: [],
            actionDesc: `enumerate(s) iteration #${stepIdx}: assigned i = ${stepIdx}, char = '${char}'. Unpacking (index, value) tuple into separate variables.`,
            activeType: "iter"
          }, s, this.app.currentProblem.syntaxExplanations);
          stepIdx++;
        } else {
          clearInterval(this.animTimer);
          this.animTimer = null;
        }
      }, 350);
      return;
    }

    // SPECIAL ANIMATION 2: stack = []
    if (target.includes("stack = []")) {
      this.app.visualizer.renderStep({
        phase: 1,
        syntaxKey: "stack = []",
        i: null,
        char: null,
        stackState: [],
        pairs: [],
        resultState: [],
        actionDesc: "stack = [] -> Python allocates empty PyListObject container in heap memory. Contiguous memory reserved with 0 elements.",
        activeType: "init"
      }, s, this.app.currentProblem.syntaxExplanations);
      return;
    }

    // SPECIAL ANIMATION 3: stack.append(i)
    if (target.includes("append")) {
      this.app.visualizer.renderStep({
        phase: 1,
        syntaxKey: "stack.append(i)",
        i: 4,
        char: "(",
        stackState: [4],
        pairs: [],
        resultState: [],
        actionDesc: "stack.append(4) -> Pushed open bracket index 4 onto top of stack container.",
        activeType: "stack-push"
      }, s, this.app.currentProblem.syntaxExplanations);
      return;
    }

    // SPECIAL ANIMATION 4: stack.pop()
    if (target.includes("pop")) {
      this.app.visualizer.renderStep({
        phase: 1,
        syntaxKey: "opening_pos = stack.pop()",
        i: 8,
        char: ")",
        poppedPos: 4,
        stackState: [],
        pairs: [{ open: 4, close: 8 }],
        resultState: [],
        actionDesc: "opening_pos = stack.pop() -> Popped opening bracket index 4 from stack. Paired with closing bracket index 8.",
        activeType: "stack-pop"
      }, s, this.app.currentProblem.syntaxExplanations);
      return;
    }

    // Default simulation action
    this.app.visualizer.renderStep(
      challenge.simulateAction, 
      s, 
      this.app.currentProblem.syntaxExplanations
    );
  }

  updateChallengeUI() {
    const challenge = this.writerChallenges[this.currentChallengeIndex];
    this.targetTitle.textContent = `Challenge ${this.currentChallengeIndex + 1}/${this.writerChallenges.length}:`;
    this.targetSnippet.textContent = challenge.target;
    this.targetSnippet.style.color = "var(--accent-emerald)";
    this.targetDesc.textContent = challenge.desc;
    this.syntaxInput.value = "";
    this.syntaxInput.placeholder = `Type: ${challenge.target}`;
  }

  /**
   * Render code lines in walkthrough view with rich syntax tokens
   */
  renderCode(problem) {
    this.lineNumbersEl.innerHTML = "";
    this.codeContentEl.innerHTML = "";

    problem.codeLines.forEach(item => {
      // Line number
      const numDiv = document.createElement("div");
      numDiv.className = "line-num";
      numDiv.id = `ln-num-${item.line}`;
      numDiv.textContent = item.line;
      this.lineNumbersEl.appendChild(numDiv);

      // Code line
      const lineDiv = document.createElement("div");
      lineDiv.className = "code-line";
      lineDiv.id = `ln-code-${item.line}`;
      lineDiv.dataset.line = item.line;

      // Syntax highlight
      lineDiv.innerHTML = this.highlightSyntax(item.text);

      // Line click handler: jump to corresponding step
      lineDiv.addEventListener("click", () => {
        this.app.jumpToLine(item.line);
      });

      this.codeContentEl.appendChild(lineDiv);
    });
  }

  /**
   * Highlights Python syntax into HTML spans
   */
  highlightSyntax(text) {
    if (!text.trim()) return "&nbsp;";

    // Escape HTML
    let safe = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Comments
    if (safe.trim().startsWith("#")) {
      return `<span class="cmt">${safe}</span>`;
    }

    // Strings
    safe = safe.replace(/(".*?"|'.*?)/g, '<span class="str">$1</span>');

    // Keywords
    const keywords = [
      "class", "def", "for", "in", "if", "elif", "else", 
      "while", "return", "and", "or", "not", "self"
    ];
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b(${kw})\\b`, "g");
      safe = safe.replace(regex, '<span class="kwd">$1</span>');
    });

    // Builtins / Functions
    const funcs = ["enumerate", "len", "append", "pop", "join", "solve", "traverse", "range", "print"];
    funcs.forEach(fn => {
      const regex = new RegExp(`\\b(${fn})\\b(?=\\()`, "g");
      safe = safe.replace(regex, '<span class="fn">$1</span>');
    });

    // Numbers
    safe = safe.replace(/\b(\d+)\b/g, '<span class="num">$1</span>');

    return safe;
  }

  /**
   * Highlight the active line during execution
   */
  setActiveLine(lineNum) {
    // Remove previous active classes
    document.querySelectorAll(".active-code-line").forEach(el => el.classList.remove("active-code-line"));
    document.querySelectorAll(".active-line-num").forEach(el => el.classList.remove("active-line-num"));

    if (!lineNum) return;

    const lineEl = document.getElementById(`ln-code-${lineNum}`);
    const numEl = document.getElementById(`ln-num-${lineNum}`);

    if (lineEl) {
      lineEl.classList.add("active-code-line");
      // Smooth scroll if off-screen
      lineEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    if (numEl) {
      numEl.classList.add("active-line-num");
    }
  }

  setMode(mode) {
    if (mode === "typewriter") {
      this.walkthroughContainer.style.display = "none";
      this.writerContainer.style.display = "flex";
      this.syntaxInput.focus();
    } else {
      this.writerContainer.style.display = "none";
      this.walkthroughContainer.style.display = "flex";
    }
  }
}

window.CodeEditor = CodeEditor;
