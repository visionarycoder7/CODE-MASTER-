/**
 * visualizer.js
 * Controls all live dynamic visual renderings on the right pane:
 * - String and enumerate iterator pointer
 * - Stack memory container (push/pop animations)
 * - Two-way bracket wormhole pairs and SVG portal bridges
 * - Output stream buffer
 * - Syntax under-the-hood explanation cards
 */

class VisualizerEngine {
  constructor() {
    this.trackEl = document.getElementById("string-track");
    this.portalSvg = document.getElementById("portal-svg");
    this.stackVessel = document.getElementById("stack-vessel");
    this.stackCount = document.getElementById("stack-count");
    this.portalPairsList = document.getElementById("portal-pairs-list");
    this.portalEmptyHint = document.getElementById("portal-empty-hint");
    this.pairsCount = document.getElementById("pairs-count");
    this.teleportStatus = document.getElementById("teleport-status");
    this.teleportText = document.getElementById("teleport-text");
    this.resultCells = document.getElementById("result-cells");
    this.resultFinalText = document.getElementById("result-final-text");

    // Insight card elements
    this.insightCategory = document.getElementById("insight-category");
    this.insightSyntaxPill = document.getElementById("insight-syntax-pill");
    this.insightTitle = document.getElementById("insight-title");
    this.insightDesc = document.getElementById("insight-explanation");

    // Tags
    this.valI = document.getElementById("iter-val-i");
    this.valChar = document.getElementById("iter-val-char");
    this.valDir = document.getElementById("iter-val-dir");
    this.dirArrow = document.getElementById("dir-arrow");

    window.addEventListener("resize", () => {
      if (this.currentPairs) {
        this.drawPortalArcs(this.currentPairs);
      }
    });
  }

  /**
   * Main render function called on every step update
   */
  renderStep(step, currentString, explanations) {
    if (!step) return;

    this.currentPairs = step.pairs || [];

    // 1. Update Insight Card
    this.updateInsight(step, explanations);

    // 2. Update Iterator Variables
    this.updateIteratorTags(step);

    // 3. Render String Cells & Active Inspection Pointer
    this.renderStringCells(currentString, step);

    // 4. Render Memory Stack
    this.renderStack(step);

    // 5. Render Bracket Portals List & SVG Connectors
    this.renderPortals(step);

    // 6. Render Result Buffer Stream
    this.renderResultStream(step);
  }

  updateInsight(step, explanations) {
    const info = (explanations && explanations[step.syntaxKey]) || {
      category: "SYNTAX EXECUTION",
      syntaxPill: step.syntaxKey || "Python Syntax",
      title: "Executing Statement",
      explanation: step.actionDesc
    };

    this.insightCategory.textContent = info.category;
    this.insightSyntaxPill.textContent = info.syntaxPill;
    this.insightTitle.textContent = info.title;
    this.insightDesc.innerHTML = `${info.explanation}<br><br><span style="color: #cbd5e1; font-family: var(--font-mono); font-size: 0.8rem; background: rgba(255,255,255,0.06); padding: 4px 8px; border-radius: 4px; display: inline-block;">⚡ Current: ${step.actionDesc}</span>`;
  }

  updateIteratorTags(step) {
    this.valI.textContent = step.i !== null && step.i !== undefined ? step.i : "-";
    this.valChar.textContent = step.char ? `'${step.char}'` : "-";

    if (step.phase === 2 && step.direction !== null) {
      this.valDir.style.display = "inline-flex";
      this.dirArrow.textContent = step.direction === 1 ? "→ (+1 Right)" : "← (-1 Left)";
      this.dirArrow.style.color = step.direction === 1 ? "var(--accent-cyan)" : "var(--accent-rose)";
    } else {
      this.valDir.style.display = "none";
    }
  }

  renderStringCells(s, step) {
    this.trackEl.innerHTML = "";
    
    for (let idx = 0; idx < s.length; idx++) {
      const char = s[idx];
      const isCurrent = step.i === idx;
      const isTeleportTarget = step.teleportTo === idx;

      const node = document.createElement("div");
      node.className = "char-node";
      node.id = `char-node-${idx}`;

      const indexLabel = document.createElement("span");
      indexLabel.className = "char-index-pill";
      indexLabel.textContent = idx;
      if (isCurrent) {
        indexLabel.style.color = "var(--accent-cyan)";
        indexLabel.style.fontWeight = "bold";
      }

      const cell = document.createElement("div");
      cell.className = "char-cell";
      cell.textContent = char;

      if (char === "(") cell.classList.add("bracket-open");
      if (char === ")") cell.classList.add("bracket-close");

      if (isCurrent) {
        cell.classList.add("active-inspect");
        const pointer = document.createElement("div");
        pointer.className = "active-pointer-indicator";
        pointer.innerHTML = "▼";
        cell.appendChild(pointer);
      }

      if (isTeleportTarget) {
        cell.classList.add("paired-glow");
      }

      node.appendChild(indexLabel);
      node.appendChild(cell);
      this.trackEl.appendChild(node);
    }

    // Draw SVG connection arcs between paired brackets
    requestAnimationFrame(() => this.drawPortalArcs(step.pairs || []));
  }

  drawPortalArcs(pairs) {
    this.portalSvg.innerHTML = "";
    if (!pairs || pairs.length === 0) return;

    const trackRect = this.trackEl.getBoundingClientRect();
    const svgRect = this.portalSvg.getBoundingClientRect();

    pairs.forEach(pair => {
      const openNode = document.getElementById(`char-node-${pair.open}`);
      const closeNode = document.getElementById(`char-node-${pair.close}`);

      if (openNode && closeNode) {
        const openRect = openNode.getBoundingClientRect();
        const closeRect = closeNode.getBoundingClientRect();

        const x1 = openRect.left + openRect.width / 2 - svgRect.left;
        const y1 = openRect.bottom - svgRect.top - 6;
        const x2 = closeRect.left + closeRect.width / 2 - svgRect.left;
        const y2 = closeRect.bottom - svgRect.top - 6;

        const distance = Math.abs(x2 - x1);
        const curveHeight = Math.min(36, distance * 0.35);

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const d = `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${y1 + curveHeight} ${x2} ${y2}`;

        path.setAttribute("d", d);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "rgba(168, 85, 247, 0.75)");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("stroke-dasharray", "4,3");

        // Glowing dot at endpoints
        const dot1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot1.setAttribute("cx", x1);
        dot1.setAttribute("cy", y1);
        dot1.setAttribute("r", 3.5);
        dot1.setAttribute("fill", "#a855f7");

        const dot2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot2.setAttribute("cx", x2);
        dot2.setAttribute("cy", y2);
        dot2.setAttribute("r", 3.5);
        dot2.setAttribute("fill", "#a855f7");

        this.portalSvg.appendChild(path);
        this.portalSvg.appendChild(dot1);
        this.portalSvg.appendChild(dot2);
      }
    });
  }

  renderStack(step) {
    const stack = step.stackState || [];
    this.stackCount.textContent = stack.length;

    // Clear vessel
    this.stackVessel.innerHTML = "";

    if (stack.length === 0 && (!step.poppedPos || step.activeType !== "stack-pop")) {
      const emptyState = document.createElement("div");
      emptyState.className = "stack-empty-state";
      emptyState.innerHTML = `
        <span class="empty-icon">[ ]</span>
        <span>Empty List Container</span>
      `;
      this.stackVessel.appendChild(emptyState);
      return;
    }

    // Render stack items bottom to top (CSS flex-direction: column-reverse puts first item at bottom)
    stack.forEach((itemIdx, pos) => {
      const item = document.createElement("div");
      item.className = "stack-item";
      item.innerHTML = `
        <span class="stack-item-char">'('</span>
        <span class="stack-item-idx">idx: ${itemIdx}</span>
      `;
      this.stackVessel.appendChild(item);
    });

    // If a pop action just occurred, show popping ghost item
    if (step.activeType === "stack-pop" && step.poppedPos !== undefined) {
      const popItem = document.createElement("div");
      popItem.className = "stack-item popping";
      popItem.innerHTML = `
        <span class="stack-item-char">'('</span>
        <span class="stack-item-idx">idx: ${step.poppedPos}</span>
      `;
      this.stackVessel.appendChild(popItem);
    }
  }

  renderPortals(step) {
    const pairs = step.pairs || [];
    this.pairsCount.textContent = `${pairs.length} pair${pairs.length === 1 ? '' : 's'}`;

    if (pairs.length === 0) {
      this.portalEmptyHint.style.display = "block";
      this.portalPairsList.innerHTML = "";
    } else {
      this.portalEmptyHint.style.display = "none";
      this.portalPairsList.innerHTML = "";

      pairs.forEach(pair => {
        const card = document.createElement("div");
        card.className = "portal-pair-card";
        const isPairedNow = (step.poppedPos === pair.open && step.i === pair.close);

        if (isPairedNow) {
          card.style.borderColor = "var(--accent-emerald)";
          card.style.background = "rgba(52, 211, 153, 0.1)";
        }

        card.innerHTML = `
          <div class="portal-pair-left">
            <span style="color:var(--accent-purple);font-weight:bold;">'('</span>
            <span style="color:var(--accent-cyan);">idx ${pair.open}</span>
          </div>
          <svg class="portal-wormhole-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
          </svg>
          <div class="portal-pair-right">
            <span style="color:var(--accent-purple);font-weight:bold;">')'</span>
            <span style="color:var(--accent-cyan);">idx ${pair.close}</span>
          </div>
        `;
        this.portalPairsList.appendChild(card);
      });
    }

    // Teleport notification in Phase 2
    if (step.activeType === "teleport") {
      this.teleportStatus.style.display = "flex";
      this.teleportText.textContent = `Jumped '(' [${step.i}] ⤹ ')' [${step.teleportTo}] & reversed direction!`;
    } else {
      this.teleportStatus.style.display = "none";
    }
  }

  renderResultStream(step) {
    const result = step.resultState || [];
    this.resultCells.innerHTML = "";
    this.resultFinalText.textContent = result.join("");

    if (result.length === 0) {
      this.resultCells.innerHTML = `<span style="color: var(--text-dim); font-size: 0.8rem; font-family: var(--font-mono); font-style: italic;">[ ] No characters written yet</span>`;
      return;
    }

    result.forEach((char, index) => {
      const cell = document.createElement("div");
      cell.className = "result-cell";
      cell.textContent = char;
      this.resultCells.appendChild(cell);
    });
  }
}

window.VisualizerEngine = VisualizerEngine;
