# CODE-MASTER- ⚡ SyntaxFlow

> **A PLATFORM WITHOUT CRYPTIC BS EXPLANATION, GAMIFIED CODING GAMES WHICH TRAINS YOUR MUSCLE MEMORY, SO YOU WRITE THE CODE WITHOUT ANY SYNTAX ERROR.**

A minimalist, high-aesthetic developer platform that animates Python syntax and memory execution in real time as you write and step through algorithmic code.

---

## 🌟 Features Built

### 1. Dual Interactive Modes
* **Walkthrough Mode**: Step-by-step algorithmic debugger with synchronized active line highlighting, playback controls (`Play`, `Pause`, `Prev`, `Next`, `Reset`), speed regulation (`0.5x`, `1.0x`, `2.0x`), and scrubbable progress bar.
* **Write Syntax Mode (Interactive Coding Space)**: 
  * Type syntax directly into the coding space (e.g. `stack = []`, `for i, char in enumerate(s):`, `stack.append(i)`, `opening_pos = stack.pop()`).
  * Watch real-time visual memory and iterator animations trigger instantly on the right canvas as you write or click quick syntax chips!
  * Includes progressive challenges and **Auto-fill ⚡** for fast exploration.

### 2. Under-the-Hood Visual Memory Engine
* **`enumerate(s)` Iterator**: Shows how Python assigns indices `0, 1, 2, ...` to characters simultaneously via tuple unpacking without manual counters.
* **`stack = []` Dynamic Memory**: Visualizes heap memory allocation of an empty `PyListObject` container ready for $O(1)$ stack operations.
* **LIFO Stack Vessel**: Dropping items into the vessel on `stack.append(i)` and popping with upward spark animation on `stack.pop()`.
* **Bracket Wormhole Portals (`close` dict)**: Maps two-way connections between `(` and `)` with animated SVG curved bridges and teleport status indicators.
* **Result Stream Buffer (`result = []`)**: Visualizes linear-time character collection and final output construction via `"".join(result)`.

### 3. Problem 1 Solved: Reverse Substrings Within Brackets
* **Algorithm**: Two-phase $O(N)$ solution:
  * **Phase 1**: Map matching parentheses pairs using a LIFO Stack.
  * **Phase 2**: Recursively traverse the string with direction inversion (`+1` right $\leftrightarrow$ `-1` left) upon encountering bracket wormholes.
* **Built-in Test Cases**:
  * `"back(aps)ce"` $\rightarrow$ `"backspace"`
  * `"(abcd)"` $\rightarrow$ `"dcba"`
  * `"(u(love)i)"` $\rightarrow$ `"iloveu"`
  * `"(ed(et(oc))el)"` $\rightarrow$ `"leetcode"`
  * Or type any custom string into `s = [ ... ]`!

---

## 🚀 Running Locally

You can open `index.html` directly in any browser, or run a lightweight local server:

```bash
# Using Python
python -m http.server 8080

# Then open in your browser
http://localhost:8080
```

---

## 🧩 Adding More LeetCode Problems

To add new problems to the platform, simply add an entry to the `window.PROBLEM_CATALOG` array in [`js/problems.js`](file:///c:/Users/SOHAN/Desktop/python/CODE%20MASTER/js/problems.js):

```javascript
{
  id: "your-problem-slug",
  title: "#XX · Problem Title",
  difficulty: "Medium",
  defaultInput: "example_input",
  testCases: ["test1", "test2"],
  phases: [
    { id: 1, name: "Phase 1 Title", desc: "Phase description" }
  ],
  codeLines: [
    { line: 1, text: "def solution():", indent: 0, type: "func" },
    ...
  ],
  syntaxExplanations: {
    "syntax_key": {
      category: "CATEGORY NAME",
      syntaxPill: "code()",
      title: "What happens under the hood",
      explanation: "Detailed explanation..."
    }
  },
  generateTrace: function(input) {
    // Return array of steps with lineNum, syntaxKey, actionDesc, and state
  }
}
```

The dropdown in the top bar automatically detects problems and renders them seamlessly.
