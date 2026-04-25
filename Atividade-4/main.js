  let expression = '';
  let justCalc = false;
  let lastResult = '';

  const exprEl = document.getElementById('expression');
  const resultEl = document.getElementById('result');

  function updateDisplay(val, expr) {
    resultEl.classList.remove('error');
    resultEl.textContent = val;
    exprEl.textContent = expr || '';

    // Adjust font size for long numbers
    const len = String(val).length;
    if (len > 12) resultEl.style.fontSize = 'clamp(18px, 4vw, 24px)';
    else if (len > 8) resultEl.style.fontSize = 'clamp(24px, 6vw, 34px)';
    else resultEl.style.fontSize = '';
  }

  function appendNum(n) {
    if (justCalc) { expression = ''; justCalc = false; }
    if (expression === '0' && n !== '.') expression = '';
    expression += n;
    updateDisplay(formatDisplay(expression), '');
  }

  function appendOp(op) {
    justCalc = false;
    const ops = ['+','-','*','/','%'];
    const lastChar = expression.slice(-1);

    if (ops.includes(lastChar)) {
      expression = expression.slice(0, -1);
    }
    if (expression === '' && op === '-') {
      expression = '-';
    } else if (expression !== '') {
      expression += op;
    }
    updateDisplay(formatDisplay(expression), '');
  }

  function appendDot() {
    if (justCalc) { expression = '0'; justCalc = false; }

    // Find current number segment
    const parts = expression.split(/[\+\-\*\/\%]/);
    const current = parts[parts.length - 1];

    if (!current.includes('.')) {
      if (!current) expression += '0';
      expression += '.';
    }
    updateDisplay(formatDisplay(expression), '');
  }

  function deleteLast() {
    if (justCalc) { clearAll(); return; }
    expression = expression.slice(0, -1);
    updateDisplay(expression || '0', '');
  }

  function clearAll() {
    expression = '';
    justCalc = false;
    lastResult = '';
    updateDisplay('0', '');
  }

  function calculate() {
    if (!expression) return;

    const display = formatDisplay(expression);
    let evalExpr = expression.replace(/÷/g, '/').replace(/×/g, '*');

    // Handle trailing operator
    const lastChar = evalExpr.slice(-1);
    if (['+','-','*','/','%'].includes(lastChar)) {
      evalExpr = evalExpr.slice(0,-1);
    }

    try {
      let result = Function('"use strict"; return (' + evalExpr + ')')();

      if (!isFinite(result)) throw new Error('Erro');
      if (isNaN(result)) throw new Error('Inválido');

      // Round floating point
      result = parseFloat(result.toPrecision(12));

      // Format result
      const formatted = formatNumber(result);
      exprEl.textContent = display + ' =';
      resultEl.textContent = formatted;
      resultEl.style.fontSize = '';

      expression = String(result);
      justCalc = true;

      // Animate
      resultEl.classList.add('animate');
      setTimeout(() => resultEl.classList.remove('animate'), 150);

    } catch(e) {
      resultEl.classList.add('error');
      resultEl.textContent = 'Erro';
      expression = '';
      justCalc = true;
    }
  }

  function formatDisplay(expr) {
    return expr
      .replace(/\*/g, '×')
      .replace(/\//g, '÷')
      || '0';
  }

  function formatNumber(n) {
    if (Math.abs(n) >= 1e12 || (Math.abs(n) < 1e-6 && n !== 0)) {
      return n.toExponential(4);
    }
    const s = String(n);
    return s.length > 14 ? parseFloat(n.toPrecision(10)).toString() : s;
  }

  // Keyboard support
  document.addEventListener('keydown', e => {
    if (e.key >= '0' && e.key <= '9') appendNum(e.key);
    else if (e.key === '+') appendOp('+');
    else if (e.key === '-') appendOp('-');
    else if (e.key === '*') appendOp('*');
    else if (e.key === '/') { e.preventDefault(); appendOp('/'); }
    else if (e.key === '%') appendOp('%');
    else if (e.key === '.') appendDot();
    else if (e.key === 'Enter' || e.key === '=') calculate();
    else if (e.key === 'Backspace') deleteLast();
    else if (e.key === 'Escape') clearAll();
  });

  // Ripple effect
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const r = document.createElement('span');
      r.classList.add('ripple');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
      this.appendChild(r);
      setTimeout(() => r.remove(), 400);
    });
  });