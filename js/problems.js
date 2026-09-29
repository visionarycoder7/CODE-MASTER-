/**
 * problems.js
 * Extensible database of LeetCode problems & step-by-step syntax simulation generators.
 * Designed to easily support adding new problems in the future.
 */

window.PROBLEM_CATALOG = [
  {
    id: "reverse-brackets",
    title: "#1190 · Reverse Substrings in Brackets",
    difficulty: "Medium",
    defaultInput: "back(aps)ce",
    testCases: ["back(aps)ce", "(abcd)", "(u(love)i)", "(ed(et(oc))el)"],
    phases: [
      { id: 1, name: "Phase 1: Bracket Stack Mapping", desc: "Map matching parentheses pairs using a LIFO Stack" },
      { id: 2, name: "Phase 2: Wormhole Traversal", desc: "Traverse string and reverse direction at bracket wormholes" }
    ],
    codeLines: [
      { line: 1, text: "class Solution:", indent: 0, type: "class" },
      { line: 2, text: "    def solve(self, s):", indent: 1, type: "func" },
      { line: 3, text: "        result = []", indent: 2, type: "stmt" },
      { line: 4, text: "        close = {\")\": {}, \"(\": {}}", indent: 2, type: "stmt" },
      { line: 5, text: "        stack = []", indent: 2, type: "stmt" },
      { line: 6, text: "        ", indent: 2, type: "blank" },
      { line: 7, text: "        # Phase 1: Map matching brackets", indent: 2, type: "comment" },
      { line: 8, text: "        for i, char in enumerate(s):", indent: 2, type: "loop" },
      { line: 9, text: "            if char == \"(\":", indent: 3, type: "cond" },
      { line: 10, text: "                stack.append(i)", indent: 4, type: "stmt" },
      { line: 11, text: "            elif char == \")\":", indent: 3, type: "cond" },
      { line: 12, text: "                opening_pos = stack.pop()", indent: 4, type: "stmt" },
      { line: 13, text: "                close[\")\"][i] = opening_pos", indent: 4, type: "stmt" },
      { line: 14, text: "                close[\"(\"][opening_pos] = i", indent: 4, type: "stmt" },
      { line: 15, text: "        ", indent: 2, type: "blank" },
      { line: 16, text: "        # Phase 2: Traverse with direction flips", indent: 2, type: "comment" },
      { line: 17, text: "        def traverse(s, direction, start):", indent: 2, type: "func" },
      { line: 18, text: "            end_bracket = \"(\" if direction == -1 else \")\"", indent: 3, type: "stmt" },
      { line: 19, text: "            other_bracket = \"(\" if end_bracket == \")\" else \")\"", indent: 3, type: "stmt" },
      { line: 20, text: "            while start < len(s) and s[start] != end_bracket:", indent: 3, type: "loop" },
      { line: 21, text: "                if s[start] == other_bracket:", indent: 4, type: "cond" },
      { line: 22, text: "                    traverse(s, -direction, close[other_bracket][start] - direction)", indent: 5, type: "call" },
      { line: 23, text: "                    start = close[other_bracket][start] + direction", indent: 5, type: "stmt" },
      { line: 24, text: "                else:", indent: 4, type: "cond" },
      { line: 25, text: "                    result.append(s[start])", indent: 5, type: "stmt" },
      { line: 26, text: "                    start += direction", indent: 5, type: "stmt" },
      { line: 27, text: "        ", indent: 2, type: "blank" },
      { line: 28, text: "        traverse(s, 1, 0)", indent: 2, type: "stmt" },
      { line: 29, text: "        return \"\".join(result)", indent: 2, type: "stmt" }
    ],

    // Syntax mechanics explanations dictionary for interactive "Write Syntax" and line highlighting
    syntaxExplanations: {
      "stack = []": {
        category: "MEMORY ALLOCATION",
        syntaxPill: "stack = []",
        title: "Creating an Empty List Container",
        explanation: "In Python, 'stack = []' allocates a contiguous dynamic array container in heap memory with 0 length. It sets up an internal pointer and over-allocation strategy so future .append() and .pop() calls run in O(1) amortized time."
      },
      "result = []": {
        category: "BUFFER INITIALIZATION",
        syntaxPill: "result = []",
        title: "Allocating Result Collector",
        explanation: "Creates an empty list to gather characters one-by-one. In Python, string concatenation with += in loops creates new strings each time O(N²); appending to a list and joining at the end achieves optimal O(N) linear time."
      },
      "close = {\")\": {}, \"(\": {}}": {
        category: "HASH MAP INDEXING",
        syntaxPill: "close = {\")\": {}, \"(\": {}}",
        title: "Creating Two-Way Wormhole Dictionary",
        explanation: "Initializes nested hash tables to store bidirectional mappings between opening '(' indices and closing ')' indices for instant O(1) teleportation jumps during traversal."
      },
      "for i, char in enumerate(s):": {
        category: "ITERATOR UNPACKING",
        syntaxPill: "for i, char in enumerate(s):",
        title: "Enumerate: Pairing Index with Character",
        explanation: "The enumerate() function returns an iterator yielding 2-tuples (index, character). Under the hood, Python calls __iter__() on the string and maintains an internal integer counter, automatically unpacking each step into variable 'i' (0-indexed) and variable 'char'."
      },
      "stack.append(i)": {
        category: "LIFO STACK PUSH",
        syntaxPill: "stack.append(i)",
        title: "Pushing Open Bracket Index to Stack",
        explanation: "When '(' is discovered, we push its character index 'i' onto the top of the stack. Because stacks are Last-In First-Out (LIFO), the most recent open bracket will naturally be matched first with the next close bracket."
      },
      "opening_pos = stack.pop()": {
        category: "LIFO STACK POP",
        syntaxPill: "opening_pos = stack.pop()",
        title: "Popping Matching Open Bracket",
        explanation: "When ')' is found, stack.pop() immediately extracts the top-most opening bracket's position in O(1) time. This guarantees correct handling of deeply nested parenthesis layers."
      },
      "close[\")\"][i] = opening_pos": {
        category: "DICTIONARY BINDING",
        syntaxPill: "close[\")\"][i] = opening_pos",
        title: "Linking Close Bracket -> Open Bracket",
        explanation: "Maps the closing parenthesis index to its matching opening parenthesis index in the hash table, creating a bridge between them."
      },
      "close[\"(\"][opening_pos] = i": {
        category: "DICTIONARY BINDING",
        syntaxPill: "close[\"(\"][opening_pos] = i",
        title: "Linking Open Bracket -> Close Bracket",
        explanation: "Completes the two-way bridge by mapping the opening index to its corresponding closing index. Now traversing in either direction can instantly jump across the bracket."
      },
      "traverse(s, 1, 0)": {
        category: "FUNCTION CALL",
        syntaxPill: "traverse(s, direction=1, start=0)",
        title: "Starting Traversal from Index 0 Moving Forward (+1)",
        explanation: "Initiates recursive traversal with initial direction +1 (left-to-right) starting at string index 0."
      },
      "traverse(s, -direction, close[other_bracket][start] - direction)": {
        category: "RECURSION & DIRECTION INVERSION",
        syntaxPill: "traverse(-direction, jump_pos)",
        title: "Wormhole Teleport & Direction Flip",
        explanation: "When entering a bracket, we invert the reading direction (direction *= -1) and teleport across the bracket pair using our precomputed map. This mimics reversing the substring without physically shuffling memory!"
      },
      "result.append(s[start])": {
        category: "BUFFER WRITE",
        syntaxPill: "result.append(s[start])",
        title: "Writing Character into Output Buffer",
        explanation: "Reads character at current position 'start' and appends it to 'result'. Non-bracket characters are preserved in their new traversal order."
      },
      "return \"\".join(result)": {
        category: "STRING BUILDER",
        syntaxPill: "\"\".join(result)",
        title: "Converting Buffer List to String",
        explanation: "Python's str.join() computes the exact required string memory once, copying all characters from the list in a single fast C-level operation."
      }
    },

    /**
     * Generates a step-by-step execution trace for any given input string s.
     */
    generateTrace: function(s) {
      const steps = [];
      const stack = [];
      const close = { ")": {}, "(": {} };
      const pairs = []; // [{ open: 4, close: 8 }]
      const result = [];

      // Step 0: Initialization
      steps.push({
        phase: 1,
        lineNum: 5,
        syntaxKey: "stack = []",
        i: null,
        char: null,
        direction: null,
        stackState: [],
        pairs: [],
        resultState: [],
        actionDesc: "Allocated empty stack container 'stack = []' and empty dictionary 'close'.",
        activeType: "init"
      });

      // Phase 1: Bracket Mapping
      for (let i = 0; i < s.length; i++) {
        const char = s[i];

        // enumerate step: pointing to index and char
        steps.push({
          phase: 1,
          lineNum: 8,
          syntaxKey: "for i, char in enumerate(s):",
          i: i,
          char: char,
          direction: 1,
          stackState: [...stack],
          pairs: [...pairs],
          resultState: [],
          actionDesc: `enumerate(s) yields index i = ${i}, char = '${char}'. Python iterator assigns both variables simultaneously.`,
          activeType: "iter"
        });

        if (char === "(") {
          // Condition check
          steps.push({
            phase: 1,
            lineNum: 9,
            syntaxKey: "for i, char in enumerate(s):",
            i: i,
            char: char,
            direction: 1,
            stackState: [...stack],
            pairs: [...pairs],
            resultState: [],
            actionDesc: `Evaluated (char == '(') -> True. Found opening parenthesis at index ${i}.`,
            activeType: "cond"
          });

          // Append to stack
          stack.push(i);
          steps.push({
            phase: 1,
            lineNum: 10,
            syntaxKey: "stack.append(i)",
            i: i,
            char: char,
            direction: 1,
            stackState: [...stack],
            pairs: [...pairs],
            resultState: [],
            actionDesc: `stack.append(${i}) -> Pushed index ${i} to stack. Current stack: [${stack.join(", ")}].`,
            activeType: "stack-push"
          });
        } else if (char === ")") {
          // Condition check
          steps.push({
            phase: 1,
            lineNum: 11,
            syntaxKey: "for i, char in enumerate(s):",
            i: i,
            char: char,
            direction: 1,
            stackState: [...stack],
            pairs: [...pairs],
            resultState: [],
            actionDesc: `Evaluated (char == ')') -> True. Found closing parenthesis at index ${i}.`,
            activeType: "cond"
          });

          if (stack.length > 0) {
            const openingPos = stack.pop();
            close[")"][i] = openingPos;
            close["("][openingPos] = i;
            pairs.push({ open: openingPos, close: i });

            // Pop step
            steps.push({
              phase: 1,
              lineNum: 12,
              syntaxKey: "opening_pos = stack.pop()",
              i: i,
              char: char,
              direction: 1,
              poppedPos: openingPos,
              stackState: [...stack],
              pairs: [...pairs.slice(0, -1)],
              resultState: [],
              actionDesc: `opening_pos = stack.pop() -> Popped index ${openingPos}. Matches closing bracket at index ${i}.`,
              activeType: "stack-pop"
            });

            // Dictionary mapping step
            steps.push({
              phase: 1,
              lineNum: 13,
              syntaxKey: "close[\")\"][i] = opening_pos",
              i: i,
              char: char,
              direction: 1,
              stackState: [...stack],
              pairs: [...pairs],
              resultState: [],
              actionDesc: `close[')'][${i}] = ${openingPos} and close['('][${openingPos}] = ${i}. Established two-way wormhole link between indices ${openingPos} and ${i}.`,
              activeType: "pair-formed"
            });
          }
        }
      }

      // Phase 1 Completion step
      steps.push({
        phase: 1,
        lineNum: 16,
        syntaxKey: "close[\")\"][i] = opening_pos",
        i: null,
        char: null,
        direction: 1,
        stackState: [...stack],
        pairs: [...pairs],
        resultState: [],
        actionDesc: `Phase 1 Complete! All ${pairs.length} parenthesis pairs are mapped in O(N) time. Ready for Phase 2 traversal.`,
        activeType: "phase-transition"
      });

      // Phase 2: Wormhole Traversal Simulation
      steps.push({
        phase: 2,
        lineNum: 28,
        syntaxKey: "traverse(s, 1, 0)",
        i: 0,
        char: s[0] || null,
        direction: 1,
        stackState: [],
        pairs: [...pairs],
        resultState: [],
        actionDesc: "traverse(s, direction=1, start=0) -> Invoking traversal starting at index 0, moving right (+1).",
        activeType: "traverse-start"
      });

      function simulateTraverse(direction, start) {
        const endBracket = direction === -1 ? "(" : ")";
        const otherBracket = endBracket === ")" ? "(" : ")";

        while (start >= 0 && start < s.length && s[start] !== endBracket) {
          const currentChar = s[start];

          if (currentChar === otherBracket) {
            const pairTarget = close[otherBracket] && close[otherBracket][start] !== undefined 
              ? close[otherBracket][start] 
              : start;
            const nextPos = pairTarget - direction;

            steps.push({
              phase: 2,
              lineNum: 22,
              syntaxKey: "traverse(s, -direction, close[other_bracket][start] - direction)",
              i: start,
              char: currentChar,
              direction: direction,
              teleportTo: pairTarget,
              stackState: [],
              pairs: [...pairs],
              resultState: [...result],
              actionDesc: `Encountered bracket '${currentChar}' at index ${start}. Teleporting across wormhole to pair at index ${pairTarget} and reversing direction to ${-direction > 0 ? '+1 (right)' : '-1 (left)'}.`,
              activeType: "teleport"
            });

            simulateTraverse(-direction, nextPos);
            start = pairTarget + direction;
          } else {
            result.push(currentChar);
            steps.push({
              phase: 2,
              lineNum: 25,
              syntaxKey: "result.append(s[start])",
              i: start,
              char: currentChar,
              direction: direction,
              stackState: [],
              pairs: [...pairs],
              resultState: [...result],
              actionDesc: `result.append('${currentChar}') -> Appended '${currentChar}' from index ${start}. Traversal pointer advances: start (${start}) + (${direction}).`,
              activeType: "append-result"
            });
            start += direction;
          }
        }
      }

      simulateTraverse(1, 0);

      // Final step: return "".join(result)
      steps.push({
        phase: 2,
        lineNum: 29,
        syntaxKey: "return \"\".join(result)",
        i: null,
        char: null,
        direction: null,
        stackState: [],
        pairs: [...pairs],
        resultState: [...result],
        actionDesc: `Completed! return "".join(result) produces final reversed string "${result.join("")}".`,
        activeType: "finished"
      });

      return {
        input: s,
        steps: steps,
        finalOutput: result.join("")
      };
    }
  }
];
