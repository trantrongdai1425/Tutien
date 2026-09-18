// ==UserScript==
// @name         Auto Tu Tiên - Auto Nerd
// @namespace    https://discord.com/
// @version      1.0.0
// @description  Script tự động chơi bot Tu Tiên Discord (Săn Boss, Bí Cảnh, Lịch Luyện, Làm Vườn, Tẩy Tủy)
// @author       Auto Nerd
// @match        https://discord.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

// AUTO NERD - Normalized Script for Browser Console / Tampermonkey

(function () {
	var sleep = function (ms, maxJitter) {
		var jitterRange =
			maxJitter !== undefined
				? maxJitter
				: Math.min(200, Math.floor(ms * 0.15));
		var randomJitter = Math.floor(Math.random() * jitterRange);
		return new Promise(function (r) {
			setTimeout(r, ms + randomJitter);
		});
	};

	var $ = function (s, d) {
		d = d || document;
		return d.querySelector(s);
	};

	var $$ = function (s, d) {
		d = d || document;
		return Array.from(d.querySelectorAll(s));
	};

	function makeDraggable(el, h) {
		var cx = 0,
			cy = 0,
			ix = 0,
			iy = 0,
			xo = 0,
			yo = 0,
			d = !1;

		function s(e) {
			var cx2 = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
			var cy2 = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;
			ix = cx2 - xo;
			iy = cy2 - yo;
			if (e.target === h || h.contains(e.target)) {
				d = !0;
				el.style.transition = "none";
			}
		}

		function m(e) {
			if (!d) return;
			if (e.cancelable) e.preventDefault();
			var cx2 = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
			var cy2 = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;
			cx = cx2 - ix;
			cy = cy2 - iy;
			xo = cx;
			yo = cy;
			el.style.transform = "translate3d(" + cx + "px, " + cy + "px, 0)";
		}

		function e() {
			d = !1;
			el.style.transition = "all 0.3s cubic-bezier(0.34,1.56,0.64,1)";
		}

		h.addEventListener("touchstart", s, { passive: !0 });
		document.addEventListener("touchmove", m, { passive: !1 });
		document.addEventListener("touchend", e, { passive: !0 });
		h.addEventListener("mousedown", s, !1);
		document.addEventListener("mousemove", m, !1);
		document.addEventListener("mouseup", e, !1);
	}

	var css = `
    .mm-wrap { position: fixed; top: 80px; left: 50%; transform: translateX(-50%); width: 300px; background: linear-gradient(145deg, #0d0d2b, #1a0a2e); border: 2px solid transparent; border-radius: 16px; box-shadow: 0 0 40px rgba(0, 240, 255, 0.12), inset 0 0 60px rgba(0, 240, 255, 0.02); z-index: 999999; font-family: Segoe UI, system-ui, sans-serif; padding: 0; color: #fff; text-align: center; background-clip: padding-box; overflow: hidden; transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); cursor: default; }
    .mm-wrap::before { content: ""; position: absolute; inset: -2px; border-radius: 18px; padding: 2px; background: linear-gradient(135deg, #00f0ff, #7b2ffc, #ff6b6b, #00f0ff); background-size: 400% 400%; -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; animation: borderGlow 3s ease infinite; pointer-events: none; }
    @keyframes borderGlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    .mm-wrap.minimized { width: 52px; height: 52px; border-radius: 50%; padding: 0; transform: translateX(-50%); box-shadow: 0 0 40px rgba(0, 240, 255, 0.4), 0 0 80px rgba(123, 47, 252, 0.2); cursor: pointer; border: 2px solid #00f0ff; background: linear-gradient(145deg, #0d0d2b, #1a0a2e); top: 80px; }
    .mm-wrap.minimized::before { inset: -2.5px; border-radius: 50%; padding: 2.5px; background: linear-gradient(135deg, #00f0ff, #7b2ffc, #ff6b6b, #00f0ff); background-size: 300% 300%; animation: borderGlow 2s ease infinite; }
    .mm-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px 10px; border-bottom: 1px solid rgba(0, 240, 255, 0.06); cursor: move; user-select: none; background: rgba(0, 0, 0, 0.15); }
    .mm-wrap.minimized .mm-header { padding: 0; border: none; width: 100%; height: 100%; justify-content: center; align-items: center; background: 0 0; cursor: pointer; }
    .mm-title { font-size: 16px; font-weight: 900; letter-spacing: 2px; background: linear-gradient(90deg, #00f0ff, #7b2ffc, #ff6b6b, #00f0ff); background-size: 300% 300%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: textGlow 3s ease infinite; pointer-events: none; }
    @keyframes textGlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    .mm-wrap.minimized .mm-title { font-size: 22px; animation: none; -webkit-text-fill-color: #00f0ff; text-shadow: 0 0 30px rgba(0, 240, 255, 0.5), 0 0 60px rgba(123, 47, 252, 0.25); }
    .mm-body { padding: 12px 16px 16px; display: flex; flex-direction: column; gap: 8px; }
    .mm-wrap.minimized .mm-body { display: none; }
    .mm-btn { width: 100%; padding: 11px 0; border: none; border-radius: 10px; font-size: 13px; font-weight: 800; color: #fff; cursor: pointer; transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); text-transform: uppercase; letter-spacing: 1.5px; font-family: Segoe UI, system-ui, sans-serif; position: relative; overflow: hidden; }
    .mm-btn::after { content: ""; position: absolute; inset: 0; background: rgba(255, 255, 255, 0); transition: all 0.3s ease; }
    .mm-btn:hover::after { background: rgba(255, 255, 255, 0.08); }
    .mm-btn:active { transform: scale(0.95); }
    .mm-btn-group { background: linear-gradient(135deg, #2a1a3a, #1a0a2e); border: 1px solid rgba(0, 240, 255, 0.06); border-radius: 10px; padding: 4px; box-shadow: 0 0 20px rgba(0, 240, 255, 0.03); }
    .mm-btn-group .mm-btn { border-radius: 8px; padding: 8px 0; font-size: 11px; margin: 2px 0; }
    .mm-btn-group .mm-btn:first-child { margin-top: 0; }
    .mm-btn-group .mm-btn:last-child { margin-bottom: 0; }
    .mm-btn-uminh { background: linear-gradient(135deg, #9b59b6, #8e44ad); box-shadow: 0 3px 15px rgba(155, 89, 182, 0.3); }
    .mm-btn-tab2 { background: linear-gradient(135deg, #ff6b6b, #ee5a24); box-shadow: 0 3px 15px rgba(255, 107, 107, 0.2); }
    .mm-btn-kimcuong { background: linear-gradient(135deg, #f9d423, #f83600); box-shadow: 0 3px 15px rgba(249, 212, 35, 0.3); }
    .mm-btn-lich { background: linear-gradient(135deg, #00d2ff, #3a7bd5); box-shadow: 0 3px 15px rgba(0, 210, 255, 0.3); }
    .mm-btn-lich10 { background: linear-gradient(135deg, #f7971e, #ffd200); box-shadow: 0 3px 15px rgba(247, 151, 30, 0.3); }
    .mm-btn-boss { background: linear-gradient(135deg, #ff6b6b, #c0392b); box-shadow: 0 3px 15px rgba(255, 107, 107, 0.3); }
    .mm-close { background: linear-gradient(135deg, #ff4b2b, #ff416c); margin-top: 4px; box-shadow: 0 3px 15px rgba(255, 65, 108, 0.2); }
    .mm-min-toggle { background: rgba(255, 255, 255, 0.05); border: 1.5px solid rgba(0, 240, 255, 0.15); color: #00f0ff; font-size: 16px; cursor: pointer; width: 30px; height: 30px; border-radius: 8px; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: 700; }
    .mm-min-toggle:hover { background: rgba(0, 240, 255, 0.12); border-color: #00f0ff; transform: scale(1.06); box-shadow: 0 0 20px rgba(0, 240, 255, 0.1); }
    .mm-min-toggle:active { transform: scale(0.92); }
    .mm-wrap.minimized .mm-min-toggle { display: none; }
    .mm-group-label { font-size: 10px; font-weight: 700; color: #ffd700; text-transform: uppercase; letter-spacing: 2px; padding: 6px 0 4px; text-align: center; border-bottom: 1px solid rgba(255, 215, 0, 0.1); }
    .mm-group-label:first-child { padding-top: 0; }
    .bot-container { position: fixed; bottom: 20px; right: 12px; width: 365px; z-index: 99999; background: linear-gradient(145deg, #0d0d2b, #1a0a2e); border-radius: 12px; border: 2px solid rgba(0, 240, 255, 0.12); box-shadow: 0 0 25px rgba(0, 240, 255, 0.06); font-family: Segoe UI, sans-serif; overflow: hidden; padding: 0; color: #fff; box-sizing: border-box; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .bot-container::after { content: ""; position: absolute; inset: -2px; border-radius: 14px; background: linear-gradient(135deg, #00f0ff, #7b2ffc, #ff6b6b, #00f0ff); background-size: 400% 400%; filter: blur(8px); opacity: 0.08; animation: borderGlow 4s ease infinite; pointer-events: none; z-index: -1; }
    .bot-container.minimized { width: 50px; height: 50px; border-radius: 50%; padding: 0; box-shadow: 0 0 30px rgba(0, 240, 255, 0.3); cursor: pointer; border: 2px solid #00f0ff; }
    .bot-container.minimized::after { inset: -2.5px; border-radius: 50%; filter: blur(10px); opacity: 0.15; }
    .bot-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px 6px; border-bottom: 1px solid rgba(0, 240, 255, 0.05); cursor: move; user-select: none; background: rgba(0, 0, 0, 0.1); }
    .bot-container.minimized .bot-header { padding: 0; border: none; width: 100%; height: 100%; justify-content: center; background: 0 0; }
    .bot-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 900; color: #00f0ff; pointer-events: none; text-shadow: 0 0 15px rgba(0, 240, 255, 0.08); }
    .bot-container.minimized .bot-title { font-size: 18px; text-shadow: 0 0 25px rgba(0, 240, 255, 0.25); }
    .bot-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; animation: pulse 1.5s infinite; flex-shrink: 0; box-shadow: 0 0 10px currentColor; }
    .bot-dot.green { background: #4caf50; color: #4caf50; }
    .bot-dot.red { background: #ff3b30; color: #ff3b30; }
    .bot-dot.yellow { background: #ffd700; color: #ffd700; }
    @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(0.6); opacity: 0.4; } }
    .bot-main-body { padding: 8px 12px 10px; transition: all 0.25s ease; overflow: hidden; max-height: 500px; }
    .bot-main-body.c { max-height: 0 !important; padding: 0 12px !important; margin: 0 !important; opacity: 0; }
    .bot-container.minimized .bot-main-body { display: none; }
    .bot-log { height: 110px; overflow-y: auto; background: rgba(0, 0, 0, 0.25); padding: 6px 10px; font-family: monospace; font-size: 10px; color: #a2ffb0; border-radius: 6px; margin-top: 4px; white-space: pre-wrap; word-break: break-all; border: 1px solid rgba(0, 240, 255, 0.03); line-height: 1.4; }
    .bot-log .log-time { color: #666; font-size: 8px; }
    .bot-log .log-click { color: #4fc3f7; font-weight: 600; }
    .bot-log .log-success { color: #81c784; font-weight: 600; }
    .bot-log .log-error { color: #ef5350; font-weight: 600; }
    .bot-log .log-warn { color: #ffb74d; font-weight: 600; }
    .bot-btn { border: none; color: #fff; font-size: 10px; font-weight: 700; padding: 0 12px; border-radius: 5px; cursor: pointer; height: 26px; display: inline-flex; align-items: center; justify-content: center; white-space: nowrap; flex-shrink: 0; transition: all 0.12s ease; text-transform: uppercase; font-family: Segoe UI, sans-serif; background: linear-gradient(135deg, #2a2a3a, #1a1a2a); border: 1px solid rgba(255, 255, 255, 0.04); gap: 4px; }
    .bot-btn:hover { transform: scale(1.03); box-shadow: 0 0 15px rgba(0, 240, 255, 0.06); }
    .bot-btn:active { transform: scale(0.94); }
    .bot-btn.off { background: linear-gradient(135deg, #333, #222) !important; border-color: rgba(255, 255, 255, 0.03) !important; opacity: 0.5; }
    .bot-btn.on { background: linear-gradient(135deg, #e91e63, #c2185b) !important; border-color: #e91e63 !important; box-shadow: 0 0 15px rgba(233, 30, 99, 0.15); }
    .bot-btn#bt2 { background: linear-gradient(135deg, #ff3b30, #ff2d55) !important; }
    .bot-btn#btu { background: linear-gradient(135deg, #9b59b6, #8e44ad) !important; }
    .bot-btn#btl { background: linear-gradient(135deg, #00d2ff, #3a7bd5) !important; }
    .bot-btn#btl10 { background: linear-gradient(135deg, #f7971e, #ffd200) !important; }
    .bot-btn#btk { background: linear-gradient(135deg, #f9d423, #f83600) !important; }
    .bot-btn#bx2 { background: linear-gradient(135deg, #444, #2a2a2a) !important; border-color: rgba(255, 255, 255, 0.05) !important; }
    .btn-row { display: flex; gap: 4px; flex-wrap: wrap; align-items: center; }
    .btn-row .bot-btn { flex: 0 1 auto; min-width: 38px; }
    .header-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
    .bc-delay-block { display: inline-flex; align-items: center; gap: 4px; background: rgba(0, 240, 255, 0.05); padding: 2px 8px; border-radius: 5px; font-size: 9px; height: 26px; border: 1px solid rgba(0, 240, 255, 0.05); color: #aaa; }
    .bc-input-ms { background: 0 0; border: none; color: #00f0ff; font-weight: 700; width: 32px; text-align: center; font-size: 9px; padding: 0; outline: 0; }
    .bc-input-ms:focus { color: #fff; }
    .bot-footer { border-top: 1px solid rgba(0, 240, 255, 0.04); margin-top: 3px; padding-top: 3px; }
  `;

	function addStyle() {
		var s = document.createElement("style");
		s.innerHTML = css;
		document.head.appendChild(s);
	}

	function skipMessage() {
		var found = false;
		$$('div[role="button"],a,span,button').forEach(function (n) {
			var t = (n.innerText || n.textContent || "").trim().toLowerCase();
			if (
				t === "bỏ qua tin nhắn" ||
				t === "bỏ qua tin" ||
				t === "dismiss message" ||
				t === "dismiss"
			) {
				n.click();
				found = true;
			}
		});
		return found;
	}

	function clearHealEphemeralNotice() {
		var btns = Array.from(
			document.querySelectorAll('button, [role="button"], a, span'),
		).filter(function (b) {
			var t = (b.innerText || "").trim().toLowerCase();
			return (
				t === "bỏ qua tin nhắn" ||
				t === "bỏ qua tin" ||
				t === "dismiss message" ||
				t === "xóa tin nhắn" ||
				t.includes("bỏ qua tin") ||
				t.includes("dismiss message")
			);
		});

		btns.forEach(function (btn) {
			var msg =
				btn.closest('[class*="message_"]') ||
				btn.closest('[class*="container_"]') ||
				btn.closest('li[id^="chat-messages-"]') ||
				btn.parentElement;

			if (!msg) return;

			var txt = (msg.innerText || "").toLowerCase();

			var isProtectedUI =
				txt.includes("lịch luyện:") ||
				txt.includes("phase") ||
				txt.includes("kết quả nhanh") ||
				txt.includes("chiến lại") ||
				txt.includes("nhanh x10") ||
				txt.includes("đồng minh") ||
				txt.includes("kẻ địch") ||
				txt.includes("trận hình đạo hữu") ||
				txt.includes("cầu chúc đạo hữu") ||
				txt.includes("hiệp ");

			if (isProtectedUI) return;

			var isHealNotice =
				txt.includes("đã tự động hồi phục") &&
				(txt.includes("sử dụng:") ||
					txt.includes("thượng phẩm") ||
					txt.includes("trung phẩm") ||
					txt.includes("hạ phẩm") ||
					txt.includes("hp hiện tại:"));

			if (isHealNotice) {
				btn.click();
			}
		});
	}

	function checkTeamStamina(scope) {
		if (!scope) return null;
		var txt = scope.innerText || scope.textContent || "";

		var costMatch = txt.match(/Tiêu\s*hao.*?(\d+)\s*Thể\s*Lực/i);
		var requiredStamina = costMatch ? parseInt(costMatch[1], 10) : 20;

		var memberItems = scope.querySelectorAll('ol li, ul li, [class*="embedFieldValue"] li');
		if (memberItems && memberItems.length > 0) {
			for (var i = 0; i < Math.min(5, memberItems.length); i++) {
				var item = memberItems[i];
				var itemTxt = item.innerText || item.textContent || "";
				var staMatch = itemTxt.match(/Thể\s*lực[^\n\d]*\(?(\d+)\s*\/\s*(\d+)\)?/i);
				if (staMatch) {
					var currentSta = parseInt(staMatch[1], 10);
					var maxSta = parseInt(staMatch[2], 10);
					if (!isNaN(currentSta) && currentSta < requiredStamina) {
						var nameEl = item.querySelector("strong, b");
						var name = nameEl ? nameEl.innerText.trim() : ("Thành viên " + (i + 1));
						return {
							hasError: true,
							reason: "Thành viên [" + name + "] chỉ còn " + currentSta + "/" + maxSta + " Thể Lực (Cần tối thiểu " + requiredStamina + " TL)!"
						};
					}
				}
			}
		} else {
			var lines = txt.split("\n");
			var currentMemberName = "";
			for (var j = 0; j < lines.length; j++) {
				var line = lines[j].trim();
				var memberLineMatch = line.match(/^\d+\.\s*(.+?)(\[|$)/);
				if (memberLineMatch) {
					currentMemberName = memberLineMatch[1].trim();
				}
				var staMatchLine = line.match(/Thể\s*lực[^\n\d]*\(?(\d+)\s*\/\s*(\d+)\)?/i);
				if (staMatchLine) {
					var curSta = parseInt(staMatchLine[1], 10);
					var maxStaLine = parseInt(staMatchLine[2], 10);
					if (!isNaN(curSta) && curSta < requiredStamina) {
						return {
							hasError: true,
							reason: "Thành viên [" + (currentMemberName || ("Vị trí " + (j + 1))) + "] chỉ còn " + curSta + "/" + maxStaLine + " Thể Lực (Cần tối thiểu " + requiredStamina + " TL)!"
						};
					}
				}
			}
		}

		return null;
	}

	function findHomeBiCanhButton() {
		var msgs = Array.from(
			document.querySelectorAll('li[id^="chat-messages-"], [class*="messageListItem"]'),
		);
		var endIdx = Math.max(0, msgs.length - 8);

		for (var i = msgs.length - 1; i >= endIdx; i--) {
			var m = msgs[i];
			var mTxt = (m.innerText || m.textContent || "").toLowerCase();
			if (
				mTxt.includes("tu luyện") ||
				mTxt.includes("thông tin") ||
				mTxt.includes("động phủ") ||
				mTxt.includes("hồ sơ") ||
				mTxt.includes("lịch luyện")
			) {
				var rawBtns = Array.from(m.querySelectorAll('button, [role="button"]'));
				var btnBC = rawBtns.find(function (b) {
					if (b.disabled || b.getAttribute("aria-disabled") === "true") return false;
					var t = (b.innerText || b.textContent || "").trim().toLowerCase();
					return (
						t === "bí cảnh" ||
						t === "bicanh" ||
						(t.includes("bí cảnh") &&
							!t.includes("độ khó") &&
							!t.includes("tham gia") &&
							!t.includes("tổ đội") &&
							!t.includes("thường") &&
							!t.includes("luyện hư"))
					);
				});
				if (btnBC) return btnBC;
			}
		}

		for (var j = msgs.length - 1; j >= endIdx; j--) {
			var msg = msgs[j];
			if (msg.querySelector('article[class*="__623de"], [class*="embedFull"]')) continue;
			var btns = Array.from(msg.querySelectorAll('button, [role="button"]'));
			var target = btns.find(function (b) {
				if (b.disabled || b.getAttribute("aria-disabled") === "true") return false;
				var t = (b.innerText || b.textContent || "").trim().toLowerCase();
				return (
					t === "bí cảnh" ||
					t === "bicanh" ||
					(t.includes("bí cảnh") &&
						!t.includes("độ khó") &&
						!t.includes("tham gia") &&
						!t.includes("tổ đội"))
				);
			});
			if (target) return target;
		}

		return null;
	}

	function mainMenu() {
		var old = $("#nerd-menu");
		if (old) old.remove();
		addStyle();
		var m = document.createElement("div");
		m.id = "nerd-menu";
		m.className = "mm-wrap";
		m.innerHTML =
			'<div class="mm-header" id="mh"><div class="mm-title">⚔️ AUTO NERD</div><button class="mm-min-toggle" id="mt">−</button></div>' +
			'<div class="mm-body" id="mb">' +
			'<div class="mm-group-label">[1] BOSS THẾ GIỚI</div>' +
			'<div class="mm-btn-group"><button class="mm-btn mm-btn-boss" id="mboss">🗡️ SĂN BOSS</button></div>' +
			'<div class="mm-group-label">[2] BÍ CẢNH</div>' +
			'<div class="mm-btn-group">' +
			'<button class="mm-btn mm-btn-tab2" id="mb2">⚔️ 2.1 BÍ CẢNH THƯỜNG</button>' +
			'<button class="mm-btn mm-btn-tab2" id="mblh">✨ 2.2 BÍ CẢNH LUYỆN HƯ</button>' +
			"</div>" +
			'<div class="mm-group-label">[3] LỊCH LUYỆN</div>' +
			'<div class="mm-btn-group">' +
			'<button class="mm-btn mm-btn-lich" id="mbl">📅 3.1 LỊCH LUYỆN</button>' +
			'<button class="mm-btn mm-btn-lich10" id="mbl10">⚡ 3.2 LỊCH LUYỆN x10</button>' +
			"</div>" +
			'<div class="mm-group-label">[4] NÔNG TRẠI</div>' +
			'<div class="mm-btn-group">' +
			'<button class="mm-btn mm-btn-kimcuong" id="mbvuon">🌱 AUTO LÀM VƯỜN</button>' +
			"</div>" +
			'<div class="mm-group-label">[5] THỂ CHẤT</div>' +
			'<div class="mm-btn-group">' +
			'<button class="mm-btn mm-btn-tab2" id="mbtaytuy">🧬 AUTO TẨY TỦY</button>' +
			"</div>" +
			'<button class="mm-btn mm-close" id="mc">✕</button>' +
			"</div>";
		document.body.appendChild(m);
		makeDraggable(m, $("#mh"));

		var isMin = false;
		function toggle() {
			isMin = !isMin;
			m.classList.toggle("minimized", isMin);
			m.style.cursor = isMin ? "pointer" : "default";
		}

		$("#mt").onclick = function (e) {
			e.stopPropagation();
			toggle();
		};
		m.onclick = function (e) {
			if (isMin) toggle();
		};
		$("#mc").onclick = function (e) {
			e.stopPropagation();
			m.remove();
		};
		$("#mboss").onclick = function (e) {
			e.stopPropagation();
			m.remove();
			runBossSan();
		};
		$("#mb2").onclick = function (e) {
			e.stopPropagation();
			m.remove();
			runBC();
		};
		$("#mblh").onclick = function (e) {
			e.stopPropagation();
			m.remove();
			menuLuyenHu();
		};
		$("#mbl").onclick = function (e) {
			e.stopPropagation();
			m.remove();
			runLich();
		};
		$("#mbl10").onclick = function (e) {
			e.stopPropagation();
			m.remove();
			runLich10();
		};
		$("#mbvuon").onclick = function (e) {
			e.stopPropagation();
			m.remove();
			runLamVuon();
		};
		$("#mbtaytuy").onclick = function (e) {
			e.stopPropagation();
			m.remove();
			runTayTuy();
		};
	}

	function menuLuyenHu() {
		var old = $("#nerd-menu-lh");
		if (old) old.remove();

		var m = document.createElement("div");
		m.id = "nerd-menu-lh";
		m.className = "mm-wrap";
		m.innerHTML =
			'<div class="mm-header" id="mlhh"><div class="mm-title">✨ BÍ CẢNH LUYỆN HƯ</div><button class="mm-min-toggle" id="mlht">−</button></div>' +
			'<div class="mm-body" id="mlhb">' +
			'<div class="mm-group-label">CHỌN ẢI LUYỆN HƯ</div>' +
			'<div class="mm-btn-group" style="display:flex;flex-direction:column;gap:6px;">' +
			'<button class="mm-btn mm-btn-kimcuong" id="m_kc">💎 1. KIM CƯƠNG THẦN ĐIỆN</button>' +
			'<button class="mm-btn mm-btn-uminh" id="m_um">🌑 2. U MINH CỔ MỘ</button>' +
			'<button class="mm-btn mm-btn-tab2" id="m_hs" style="background:linear-gradient(135deg,#990000,#cc0000) !important;">🩸 3. HUYẾT MA UYÊN</button>' +
			'<button class="mm-btn mm-btn-tab2" id="m_vm" style="background:linear-gradient(135deg,#1b5e20,#388e3c) !important;">🌿 4. VẠN MỘC LINH CẢNH</button>' +
			"</div>" +
			'<div style="margin-top:10px;"><button class="mm-btn mm-btn-boss" id="m_back" style="width:100%;background:linear-gradient(135deg,#4a5568,#2d3748) !important;">↩️ QUAY LẠI</button></div>' +
			"</div>";
		document.body.appendChild(m);
		makeDraggable(m, $("#mlhh"));

		var isMin = false;
		function toggle() {
			isMin = !isMin;
			m.classList.toggle("minimized", isMin);
			m.style.cursor = isMin ? "pointer" : "default";
		}

		$("#mlht").onclick = function (e) {
			e.stopPropagation();
			toggle();
		};
		m.onclick = function (e) {
			if (isMin) toggle();
		};

		$("#m_kc").onclick = function (e) {
			e.stopPropagation();
			m.remove();
			runKimCuong();
		};
		$("#m_um").onclick = function (e) {
			e.stopPropagation();
			m.remove();
			runUMinh();
		};
		$("#m_hs").onclick = function (e) {
			e.stopPropagation();
			m.remove();
			runHuyetSat();
		};
		$("#m_vm").onclick = function (e) {
			e.stopPropagation();
			m.remove();
			runVanMoc();
		};
		$("#m_back").onclick = function (e) {
			e.stopPropagation();
			m.remove();
			mainMenu();
		};
	}

	function runHuyetSat() {
		runStandardBC({
			id: "bhs",
			title: "🩸 HUYẾT MA UYÊN",
			colorGrad: "linear-gradient(135deg,#e74c3c,#c0392b)",
			intervalKey: "_huyetsat",
			onExit: function () {
				menuLuyenHu();
			},
		});
	}

	function runVanMoc() {
		if (window._vanmoc) clearInterval(window._vanmoc);
		var c = makeBot(
			"bvm",
			'<div class="bot-header" id="bvmh"><div class="bot-title"><span class="bot-dot" id="statusDotVM"></span>🌿 VẠN MỘC LINH CẢNH</div><div class="header-right"><div class="bc-delay-block">⏱️Delay<input type="number" id="vmdel" value="2000" min="200" step="100" class="bc-input-ms"><span>ms</span></div><div class="bc-delay-block" title="Giới hạn số lần đi (0 = Vô hạn)">🎯Lần<input type="number" id="vmlim" value="0" min="0" step="1" class="bc-input-ms" style="width:24px;"></div><button id="bmvm" class="bot-btn" style="background:0 0;border:1px solid rgba(0,240,255,0.08);color:#00f0ff;font-size:14px;cursor:pointer;padding:0 6px;height:24px;">−</button></div></div><div class="bot-main-body" id="bvmm"><div class="btn-row"><button class="bot-btn off" id="bhealVM">💊 HỒI TOÀN ĐỘI</button><button class="bot-btn on" id="bvmSafe">🛡️ AN TOÀN</button><button class="bot-btn off" id="bvmRisk">🔥 RỦI RO</button><button class="bot-btn" id="btvm">STOP</button><button class="bot-btn" id="bxvm">THOÁT</button></div><div class="bot-footer"><div class="bot-log" id="blvm"></div></div></div>',
			"#bvmh",
			function () {
				menuLuyenHu();
			},
		);

		var log = $("#blvm");
		var main = $("#bvmm");
		var min = $("#bmvm");
		var tog = $("#btvm");
		var del = $("#vmdel");
		var lim = $("#vmlim");
		var healBtn = $("#bhealVM");
		var btnSafe = $("#bvmSafe");
		var btnRisk = $("#bvmRisk");
		var dot = $("#statusDotVM");
		var run = true;
		var delay = 2000;
		var maxRuns = 0;
		var runCount = 0;
		var mini = false;
		var wait = false;
		var healMode = false;
		var isHealing = false;
		var mode = "SAFE";
		var startClickCount = 0;
		var lastActionName = "";
		var actionClickCount = 0;
		var noButtonTickCount = 0;

		dot.className = "bot-dot green";
		min.onclick = function (e) {
			e.stopPropagation();
			mini = !mini;
			main.classList.toggle("c", mini);
			min.textContent = mini ? "+" : "−";
		};

		function lg(t, type) {
			type = type || "";
			var time = new Date().toLocaleTimeString();
			log.innerHTML +=
				'<span class="log-time">[' +
				time +
				']</span> <span class="log-' +
				type +
				'">' +
				t +
				"</span>";
			if (log.childNodes.length > 15) log.removeChild(log.firstChild);
			log.scrollTop = log.scrollHeight;
		}

		btnSafe.onclick = function (e) {
			e.stopPropagation();
			mode = "SAFE";
			btnSafe.className = "bot-btn on";
			btnRisk.className = "bot-btn off";
			lg("🛡️ CHẾ ĐỘ: AN TOÀN (Thu thập an toàn)", "success");
		};

		btnRisk.onclick = function (e) {
			e.stopPropagation();
			mode = "RISK";
			btnRisk.className = "bot-btn on";
			btnSafe.className = "bot-btn off";
			lg("🔥 CHẾ ĐỘ: RỦI RO (Bruteforce farm hạt giống)", "warn");
		};

		async function autoHealTeamVM() {
			if (!healMode || isHealing) return false;
			isHealing = true;
			lg("💊 ĐANG HỒI TOÀN ĐỘI...", "click");
			healBtn.className = "bot-btn on";
			healBtn.innerText = "💊 ĐANG HỒI...";

			var scope = getVanMocScope();
			var searchRoot = scope || document;

			var hf = Array.from(
				searchRoot.querySelectorAll('button, a, [role="button"]'),
			).find(function (x) {
				var t = (x.innerText || x.textContent || "").trim().toLowerCase();
				return (
					t.includes("hồi toàn đội") ||
					t.includes("hồi máu") ||
					t.includes("hồi đội")
				);
			});

			if (hf) {
				hf.click();
				lg("✅ HỒI TOÀN ĐỘI LẦN 1", "success");
				await sleep(500);
				hf.click();
				lg("✅ HỒI TOÀN ĐỘI LẦN 2", "success");
				await sleep(600);

				var st = null;
				for (var attempt = 0; attempt < 3; attempt++) {
					var currentScope = getVanMocScope() || document;
					st = Array.from(
						currentScope.querySelectorAll('button, a, [role="button"]'),
					).find(function (x) {
						var t = (x.innerText || x.textContent || "").trim().toLowerCase();
						return (
							t.includes("bắt đầu") ||
							t.includes("bắtđầu") ||
							t.includes("khởi hành") ||
							t.includes("khám phá")
						);
					});
					if (st) break;
					await sleep(400);
				}

				if (st) {
					st.click();
					lg("✅ BẮT ĐẦU", "success");
					healBtn.className = "bot-btn on";
					healBtn.innerText = "💊 HỒI TOÀN ĐỘI";
					isHealing = false;
					return true;
				} else {
					lg("⚠️ KHÔNG THẤY BẮT ĐẦU", "warn");
					healBtn.className = "bot-btn on";
					healBtn.innerText = "💊 HỒI TOÀN ĐỘI";
					isHealing = false;
					return false;
				}
			} else {
				lg("⚠️ KHÔNG THẤY HỒI TOÀN ĐỘI", "warn");
				isHealing = false;
				return false;
			}
		}

		healBtn.onclick = function (e) {
			e.stopPropagation();
			healMode = !healMode;
			if (healMode) {
				healBtn.className = "bot-btn on";
				healBtn.innerText = "💊 HỒI TOÀN ĐỘI";
				lg("🔴 HỒI TOÀN ĐỘI: BẬT", "click");
			} else {
				healBtn.className = "bot-btn off";
				healBtn.innerText = "💊 HỒI TOÀN ĐỘI";
				lg("⚪ HỒI TOÀN ĐỘI: TẮT", "warn");
			}
		};

		function updateStatus(state) {
			dot.className = "bot-dot";
			if (state === "RUN") {
				dot.classList.add("green");
				tog.innerText = "STOP";
				tog.style.background = "linear-gradient(135deg,#00b09b,#96c93d)";
			} else if (state === "STOP") {
				dot.classList.add("yellow");
				tog.innerText = "RUN";
				tog.style.background = "linear-gradient(135deg,#4caf50,#2e7d32)";
			} else if (state === "PAUSE") {
				dot.classList.add("red");
				tog.innerText = "RUN";
				tog.style.background = "linear-gradient(135deg,#ff6b35,#f7931e)";
			}
		}

		tog.onclick = function () {
			if (run) {
				run = false;
				updateStatus("STOP");
				lg("⏸️ DỪNG", "warn");
			} else {
				if (maxRuns > 0 && runCount >= maxRuns) {
					runCount = 0;
					lg("🔄 RESET ĐẾM SỐ LẦN ĐI (0/" + maxRuns + ")", "click");
				}
				run = true;
				updateStatus("RUN");
				lg("▶️ CHẠY", "success");
			}
		};

		del.oninput = function () {
			var v = parseInt(del.value) || 2000;
			delay = Math.max(200, v);
		};

		lim.oninput = function () {
			var v = parseInt(lim.value) || 0;
			maxRuns = Math.max(0, v);
			if (maxRuns > 0) {
				lg("🎯 GIỚI HẠN: " + maxRuns + " LẦN (Đã đi: " + runCount + "/" + maxRuns + ")", "click");
			} else {
				lg("🎯 GIỚI HẠN: VÔ HẠN (0)", "warn");
			}
		};

		var exitBtn = $("#bxvm");
		if (exitBtn) {
			exitBtn.onclick = function (e) {
				e.stopPropagation();
				if (window._vanmoc) clearInterval(window._vanmoc);
				c.remove();
				menuLuyenHu();
			};
		}

		function checkError(scope) {
			if (!scope) return false;
			var staErr = checkTeamStamina(scope);
			if (staErr && staErr.hasError) {
				if (run) {
					run = false;
					updateStatus("PAUSE");
					lg("⚠️ " + staErr.reason, "error");
					return true;
				}
			}
			return false;
		}

		var lastActionTime = 0;

		function getVanMocScope() {
			var embeds = Array.from(
				document.querySelectorAll(
					'article[class*="__623de"], [class*="embedFull"], [class*="embedWrapper"]',
				),
			);
			if (embeds.length > 0) {
				var targetEmbed = embeds[embeds.length - 1];
				var container =
					targetEmbed.closest('li[id^="chat-messages-"]') ||
					targetEmbed.closest('[class*="messageListItem"]') ||
					targetEmbed.closest('[id^="message-accessories-"]') ||
					targetEmbed.closest('[class*="container_b7e1cb"]') ||
					targetEmbed.closest('[class*="container_"]') ||
					targetEmbed.parentElement;
				if (container) return container;
			}

			var msgs = Array.from(
				document.querySelectorAll(
					'li[id^="chat-messages-"], [class*="messageListItem"]',
				),
			);
			for (var i = msgs.length - 1; i >= Math.max(0, msgs.length - 2); i--) {
				var m = msgs[i];
				if (m.querySelector('[class*="actionRow"], [id^="message-accessories-"], [class*="container_"]')) {
					return m;
				}
			}

			return null;
		}

		async function loop() {
			if (!run || wait || isHealing) return;
			skipMessage();

			var scope = getVanMocScope();
			if (checkError(scope)) return;
			if (!scope) return;

			var rawBtns = Array.from(
				scope.querySelectorAll('[class*="actionRow"] button, [id^="message-accessories-"] button, [class*="container_"] button, button[class*="component"], [role="button"][class*="component"]')
			);

			if (!rawBtns.length) {
				rawBtns = Array.from(scope.querySelectorAll('button, [role="button"]'));
			}

			var btns = rawBtns.filter(function (b) {
				if (b.disabled || b.getAttribute("aria-disabled") === "true") return false;

				var aria = (b.getAttribute("aria-label") || "").toLowerCase();
				if (
					aria.includes("reaction") ||
					aria.includes("phản ứng") ||
					aria.includes("reply") ||
					aria.includes("trả lời") ||
					aria.includes("more") ||
					aria.includes("khác") ||
					aria.includes("pin") ||
					aria.includes("ghim") ||
					aria.includes("emoji") ||
					aria.includes("gif") ||
					aria.includes("sticker") ||
					aria.includes("gift") ||
					aria.includes("app")
				) {
					return false;
				}

				if (b.hasAttribute("data-mana-component")) return false;

				var t = (b.innerText || b.textContent || "").trim().toLowerCase();
				if (!t) return false;
				if (
					t.includes("bỏ qua tin") ||
					t.includes("dismiss") ||
					t.includes("rời đội") ||
					t.includes("cuộc trò chuyện") ||
					t.includes("tìm hoặc") ||
					t.includes("trò chuyện")
				) {
					return false;
				}
				return true;
			});

			function trackActionAndCheckLag(actionName) {
				if (lastActionName === actionName) {
					actionClickCount++;
				} else {
					lastActionName = actionName;
					actionClickCount = 1;
				}

				if (actionClickCount >= 4) {
					var homeBtn = findHomeBiCanhButton();
					if (homeBtn) {
						wait = true;
						lg("🚨 KẸT ẢI (" + lastActionName + " x" + actionClickCount + ") -> BẤM 'BÍ CẢNH' Ở TRANG CHỦ!", "warn");
						homeBtn.click();
						actionClickCount = 0;
						lastActionName = "";
						startClickCount = 0;
						return true;
					} else {
						run = false;
						updateStatus("PAUSE");
						lg("⚠️ KẸT ẢI (" + lastActionName + " x" + actionClickCount + ") NHƯNG KHÔNG TÌM THẤY ENTRY 'BÍ CẢNH' TRANG CHỦ (TRONG 8 TIN GẦN NHẤT) -> TẠM DỪNG!", "error");
						actionClickCount = 0;
						lastActionName = "";
						return true;
					}
				}
				return false;
			}

			if (!btns.length) {
				noButtonTickCount++;
				if (noButtonTickCount >= 4) {
					var homeBtn = findHomeBiCanhButton();
					if (homeBtn) {
						wait = true;
						lg("🚨 GIAO DIỆN TREO KHÔNG NÚT (>4s) -> BẤM 'BÍ CẢNH' Ở TRANG CHỦ!", "warn");
						homeBtn.click();
						noButtonTickCount = 0;
						actionClickCount = 0;
						lastActionName = "";
						startClickCount = 0;
						await sleep(3000 + jitter);
						wait = false;
						return;
					} else {
						run = false;
						updateStatus("PAUSE");
						lg("⚠️ GIAO DIỆN TREO KHÔNG NÚT (>4s) & KHÔNG TÌM THẤY ENTRY 'BÍ CẢNH' TRANG CHỦ (TRONG 8 TIN GẦN NHẤT) -> TẠM DỪNG!", "error");
						noButtonTickCount = 0;
						return;
					}
				}
				return;
			}
			noButtonTickCount = 0;

			var jitter = Math.floor(Math.random() * 200);

			var btnKetQua = btns.find(function (b) {
				var t = (b.innerText || b.textContent || "").trim().toLowerCase();
				return (
					t.includes("kết quả nhanh") ||
					t.includes("xem kết quả") ||
					t.includes("kết quả")
				);
			});
			if (btnKetQua) {
				if (trackActionAndCheckLag("KẾT QUẢ NHANH")) {
					await sleep(3000 + jitter);
					wait = false;
					return;
				}
				wait = true;
				lg("📊 NHẤN: " + (btnKetQua.innerText || btnKetQua.textContent || "").trim() + (actionClickCount > 1 ? " (Lần " + actionClickCount + ")" : ""), "click");
				btnKetQua.click();
				await sleep(1500);
				wait = false;
				return;
			}

			var btnChienTiep = btns.find(function (b) {
				var t = (b.innerText || b.textContent || "").trim().toLowerCase();
				return t.includes("chiến tiếp");
			});
			if (btnChienTiep) {
				startClickCount = 0;
				actionClickCount = 0;
				lastActionName = "";
				runCount++;
				lg("🏁 HOÀN THÀNH LƯỢT " + runCount + (maxRuns > 0 ? "/" + maxRuns : ""), "success");
				if (maxRuns > 0 && runCount >= maxRuns) {
					wait = true;
					lg("✅ NHẤN: " + (btnChienTiep.innerText || btnChienTiep.textContent || "").trim(), "click");
					btnChienTiep.click();
					run = false;
					updateStatus("STOP");
					lg("🛑 ĐÃ HOÀN THÀNH ĐỦ " + maxRuns + " LẦN ĐI -> TỰ ĐỘNG DỪNG AUTO!", "warn");
					wait = false;
					return;
				}
				wait = true;
				lg("✅ NHẤN: " + (btnChienTiep.innerText || btnChienTiep.textContent || "").trim(), "click");
				btnChienTiep.click();
				lg("⏳ DỪNG 3S TRƯỚC KHI HỒI...", "warn");
				await sleep(3000);
				if (healMode) {
					lg("💊 THỰC HIỆN HỒI TOÀN ĐỘI...", "click");
					await autoHealTeamVM();
				} else {
					lg("⚪ HỒI TOÀN ĐỘI ĐANG TẮT, BỎ QUA", "warn");
				}
				wait = false;
				return;
			}

			var btnTiepTuc = btns.find(function (b) {
				var t = (b.innerText || b.textContent || "").trim().toLowerCase();
				return t.includes("tiếp tục");
			});
			if (btnTiepTuc) {
				if (trackActionAndCheckLag("TIẾP TỤC")) {
					await sleep(3000 + jitter);
					wait = false;
					return;
				}
				startClickCount = 0;
				wait = true;
				lg("⏩ TIẾP TỤC ẢI: " + (btnTiepTuc.innerText || btnTiepTuc.textContent || "").trim() + (actionClickCount > 1 ? " (Lần " + actionClickCount + ")" : ""), "click");
				btnTiepTuc.click();
				await sleep(delay + jitter);
				wait = false;
				return;
			}

			var combatKeywords = [
				"khai chiến",
				"khiêu chiến",
				"chiến đấu",
				"vào trận",
				"tiến vào",
				"tấn công",
				"bắt đầu đánh",
				"khai trận",
			];
			var btnKhaiChien = btns.find(function (b) {
				var t = (b.innerText || b.textContent || "").trim().toLowerCase();
				return combatKeywords.some(function (k) {
					return t.includes(k);
				});
			});
			if (btnKhaiChien) {
				if (trackActionAndCheckLag("KHAI CHIẾN")) {
					await sleep(3000 + jitter);
					wait = false;
					return;
				}
				var now = Date.now();
				if (now - lastActionTime < 3500) {
					return;
				}
				wait = true;
				lastActionTime = now;
				lg("⚔️ NHẤN: " + (btnKhaiChien.innerText || btnKhaiChien.textContent || "").trim() + (actionClickCount > 1 ? " (Lần " + actionClickCount + ")" : ""), "click");
				btnKhaiChien.click();
				await sleep(2500 + jitter);
				wait = false;
				return;
			}

			var mushroomKeywords = [
				"hái nấm linh xanh thạch",
				"hái nấm linh thanh ngọc",
				"hái nấm linh bạch vân",
				"xanh thạch",
				"thanh ngọc",
				"bạch vân",
			];
			var mushBtns = btns.filter(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return mushroomKeywords.some(function (k) {
					return t.includes(k);
				});
			});
			if (mushBtns.length > 0) {
				if (trackActionAndCheckLag("VƯỜN LINH NẤM")) {
					await sleep(3000 + jitter);
					wait = false;
					return;
				}
				var chosenMush = mushBtns[Math.floor(Math.random() * mushBtns.length)];
				wait = true;
				lg(
					"🍄 [VƯỜN LINH NẤM] RANDOM CHỌN: " + chosenMush.innerText.trim() + (actionClickCount > 1 ? " (Lần " + actionClickCount + ")" : ""),
					"click",
				);
				chosenMush.click();
				await sleep(delay + jitter);
				wait = false;
				return;
			}

			var btnCayThanA = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return (
					t.includes("nuôi dưỡng cây thần") ||
					(t.includes("nuôi dưỡng") && !t.includes("hái"))
				);
			});
			var btnCayThanB = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return (
					t.includes("hái hạt giống thần mộc") ||
					t.includes("hái hạt giống") ||
					t.includes("hạt giống")
				);
			});

			var chosenCayThan = null;
			if (mode === "SAFE" && btnCayThanA) {
				chosenCayThan = btnCayThanA;
			} else if (mode === "RISK" && btnCayThanB) {
				chosenCayThan = btnCayThanB;
			}

			if (chosenCayThan) {
				if (trackActionAndCheckLag("CÂY THẦN")) {
					await sleep(3000 + jitter);
					wait = false;
					return;
				}
				wait = true;
				lg("🌳 NHẤN: " + chosenCayThan.innerText.trim() + (actionClickCount > 1 ? " (Lần " + actionClickCount + ")" : ""), "click");
				chosenCayThan.click();
				await sleep(delay + jitter);
				wait = false;
				return;
			}

			var btnLinhThuA = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return (
					t.includes("tha mạng & chữa trị") ||
					t.includes("tha mạng") ||
					(t.includes("chữa trị") && !t.includes("trảm"))
				);
			});
			var btnLinhThuB = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return (
					t.includes("trảm sát thu linh vật") ||
					t.includes("trảm sát") ||
					t.includes("thu linh vật")
				);
			});

			var chosenLinhThu = null;
			if (mode === "SAFE" && btnLinhThuA) {
				chosenLinhThu = btnLinhThuA;
			} else if (mode === "RISK" && btnLinhThuB) {
				chosenLinhThu = btnLinhThuB;
			}

			if (chosenLinhThu) {
				if (trackActionAndCheckLag("LINH THÚ")) {
					await sleep(3000 + jitter);
					wait = false;
					return;
				}
				wait = true;
				lg("🦊 NHẤN: " + chosenLinhThu.innerText.trim() + (actionClickCount > 1 ? " (Lần " + actionClickCount + ")" : ""), "click");
				chosenLinhThu.click();
				await sleep(delay + jitter);
				wait = false;
				return;
			}

			var targetGate = null;
			var pList = ["sinh", "hưu", "cảnh", "khai", "thương", "kinh"];
			for (var i = 0; i < pList.length; i++) {
				var p = pList[i];
				targetGate = btns.find(function (b) {
					return (
						b.innerText.toLowerCase().includes(p) && b.innerText.includes("[")
					);
				});
				if (targetGate) break;
			}
			if (targetGate) {
				if (trackActionAndCheckLag("CỔNG BÁT MÔN: " + targetGate.innerText.trim())) {
					await sleep(3000 + jitter);
					wait = false;
					return;
				}
				wait = true;
				lg("🚪 NHẤN CỔNG: " + targetGate.innerText.trim() + (actionClickCount > 1 ? " (Lần " + actionClickCount + ")" : ""), "click");
				targetGate.click();
				await sleep(delay + jitter);
				wait = false;
				return;
			}

			var btnStart = btns.find(function (b) {
				var t = (b.innerText || b.textContent || "").trim().toLowerCase();
				return (
					(t === "bắt đầu" || t.startsWith("bắt đầu") || t.includes("bắt đầu") || t.includes("khởi hành") || t.includes("khám phá")) &&
					!t.includes("cuộc trò chuyện") &&
					!t.includes("tìm hoặc") &&
					!t.includes("trò chuyện")
				);
			});
			if (btnStart) {
				if (maxRuns > 0 && runCount >= maxRuns) {
					run = false;
					updateStatus("STOP");
					lg("🛑 ĐÃ ĐẠT GIỚI HẠN " + maxRuns + " LẦN ĐI -> DỪNG AUTO!", "warn");
					return;
				}

				startClickCount++;
				if (startClickCount >= 4) {
					var homeBtn = findHomeBiCanhButton();
					if (homeBtn) {
						wait = true;
						lg("🚨 SẢNH KẸT BẮT ĐẦU " + startClickCount + " LẦN -> BẤM 'BÍ CẢNH' Ở TRANG CHỦ!", "warn");
						homeBtn.click();
						startClickCount = 0;
						actionClickCount = 0;
						lastActionName = "";
						await sleep(3000 + jitter);
						wait = false;
						return;
					} else {
						run = false;
						updateStatus("PAUSE");
						lg("⚠️ SẢNH KẸT BẮT ĐẦU " + startClickCount + " LẦN & KHÔNG TÌM THẤY ENTRY 'BÍ CẢNH' TRANG CHỦ (TRONG 8 TIN GẦN NHẤT) -> TẠM DỪNG!", "error");
						startClickCount = 0;
						return;
					}
				}

				if (startClickCount >= 3) {
					var btnRefreshNow = btns.find(function (b) {
						var t = (b.innerText || b.textContent || "").trim().toLowerCase();
						return (
							t.includes("làm mới") ||
							t.includes("làmmới") ||
							t.includes("cập nhật") ||
							t.includes("refresh")
						);
					});
					if (btnRefreshNow) {
						wait = true;
						lg("🔄 ĐÃ BẤM BẮT ĐẦU " + startClickCount + " LẦN CHƯA PHẢN HỒI -> BẤM LÀM MỚI SẢNH!", "warn");
						btnRefreshNow.click();
						await sleep(delay + jitter);
						wait = false;
						return;
					}
				}

				wait = true;
				lg("✅ BẮT ĐẦU" + (startClickCount > 1 ? " (Lần " + startClickCount + ")" : ""), "click");
				btnStart.click();
				await sleep(delay + jitter);
				wait = false;
				return;
			}

			var btnRefresh = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return (
					t.includes("làm mới") ||
					t.includes("làmmới") ||
					t.includes("cập nhật") ||
					t.includes("refresh")
				);
			});
			if (btnRefresh) {
				wait = true;
				lg(
					"🔄 NHẤN: " +
						btnRefresh.innerText.trim() +
						" (Tự động hiện lại nút Bắt đầu)",
					"click",
				);
				btnRefresh.click();
				await sleep(delay + jitter);
				wait = false;
				return;
			}
		}

		window._vanmoc = setInterval(loop, 1000);
		updateStatus("RUN");
		lg("🌿 KHỞI ĐỘNG VẠN MỘC LINH CẢNH", "success");
		lg("🛡️ CHẾ ĐỘ: AN TOÀN", "success");
		lg("⚪ HỒI TOÀN ĐỘI: TẮT", "warn");
	}

	function makeBot(id, html, hid, onExit) {
		var old = $("#" + id);
		if (old) old.remove();
		var c = document.createElement("div");
		c.id = id;
		c.className = "bot-container";
		c.innerHTML = html;
		document.body.appendChild(c);
		makeDraggable(c, $(hid));

		var exitBtn =
			c.querySelector("#bx" + id) ||
			c.querySelector("#bx" + id.replace(/^b/, "")) ||
			c.querySelector("#bx" + id.slice(-1)) ||
			c.querySelector('[id^="bx"]') ||
			Array.from(c.querySelectorAll("button")).find(function (b) {
				return (b.innerText || "").trim().toLowerCase() === "thoát";
			});

		if (exitBtn) {
			exitBtn.onclick = function (e) {
				e.stopPropagation();
				if (window._bc) clearInterval(window._bc);
				if (window._uminh) clearInterval(window._uminh);
				if (window._lich) clearInterval(window._lich);
				if (window._lich10) clearInterval(window._lich10);
				if (window._kimcuong) clearInterval(window._kimcuong);
				if (window._vanmoc) clearInterval(window._vanmoc);
				if (window._huyetsat) clearInterval(window._huyetsat);
				if (window._bossSan) clearInterval(window._bossSan);
				if (window._lamvuon) clearInterval(window._lamvuon);
				if (window._taytuy) clearInterval(window._taytuy);
				c.remove();
				if (onExit) onExit();
			};
		}

		var minBtn =
			c.querySelector("#bm" + id) ||
			c.querySelector("#bm" + id.replace(/^b/, "")) ||
			c.querySelector("#bm" + id.slice(-1)) ||
			c.querySelector('[id^="bm"]') ||
			c.querySelector(".header-right button");

		if (minBtn) {
			var isMin = false;
			minBtn.onclick = function (e) {
				e.stopPropagation();
				isMin = !isMin;
				c.classList.toggle("minimized", isMin);
				c.style.transform = "translate3d(0,0,0)";
			};
			c.onclick = function () {
				if (isMin) {
					isMin = false;
					c.classList.remove("minimized");
					c.style.transform = "translate3d(0,0,0)";
				}
			};
		}
		return c;
	}

	function runTayTuy() {
		if (window._taytuy) clearInterval(window._taytuy);

		var html =
			'<div class="bot-header" id="tth">' +
			'<div class="bot-title"><span class="bot-dot" id="statusDotTT"></span>🧬 AUTO TẨY TỦY THỂ CHẤT</div>' +
			'<div class="header-right">' +
			'<button id="bmtt" class="bot-btn" style="background:0 0;border:1px solid rgba(0,240,255,0.08);color:#00f0ff;font-size:14px;cursor:pointer;padding:0 6px;height:24px;">−</button>' +
			"</div></div>" +
			'<div class="bot-main-body" id="ttm" style="max-height:500px;">' +
			'<div class="btn-row" style="margin-bottom:6px;"><button class="bot-btn" id="bttt" style="flex:1;height:28px;font-size:10px;background:linear-gradient(135deg,#ff3b30,#ff2d55) !important;">▶️ CHẠY</button><button class="bot-btn" id="bxtt" style="height:28px;font-size:10px;padding:0 14px;">THOÁT</button></div>' +
			'<div class="bot-footer">' +
			'<div class="bot-log" id="bltt" style="height:110px;font-size:10px;line-height:1.4;"></div>' +
			"</div></div>";

		var c = makeBot("tt", html, "#tth", function () {
			mainMenu();
		});
		c.style.width = "310px";

		var log = $("#bltt");
		var main = $("#ttm");
		var min = $("#bmtt");
		var tog = $("#bttt");
		var dot = $("#statusDotTT");

		var run = false;
		var wait = false;

		dot.className = "bot-dot yellow";

		function lg(t, type) {
			type = type || "";
			var time = new Date().toLocaleTimeString();
			log.innerHTML +=
				'<span class="log-time">[' +
				time +
				']</span> <span class="log-' +
				type +
				'">' +
				t +
				"</span>";
			if (log.childNodes.length > 15) log.removeChild(log.firstChild);
			log.scrollTop = log.scrollHeight;
		}

		function updateStatus(state) {
			dot.className = "bot-dot";
			if (state === "RUN") {
				dot.classList.add("green");
				tog.innerText = "STOP";
				tog.style.background = "linear-gradient(135deg,#4caf50,#2e7d32)";
			} else if (state === "STOP") {
				dot.classList.add("yellow");
				tog.innerText = "▶️ CHẠY";
				tog.style.background = "linear-gradient(135deg,#ff3b30,#ff2d55)";
			}
		}

		tog.onclick = function () {
			if (run) {
				run = false;
				updateStatus("STOP");
				lg("⏸️ DỪNG", "warn");
			} else {
				run = true;
				updateStatus("RUN");
				lg("▶️ CHẠY", "success");
			}
		};

		function getTayTuyScope() {
			var embeds = Array.from(
				document.querySelectorAll('article[class*="__623de"], [class*="embedFull"], [class*="markup_"]')
			);
			if (!embeds.length) return document;

			var targetEmbed = null;
			for (var i = embeds.length - 1; i >= 0 && i >= embeds.length - 5; i--) {
				var emb = embeds[i];
				var txt = (emb.innerText || "").toLowerCase();
				if (
					txt.includes("quản lý thể chất") ||
					txt.includes("kết quả tẩy tủy") ||
					txt.includes("tẩy tủy") ||
					txt.includes("thể chất cũ") ||
					txt.includes("thể chất mới")
				) {
					targetEmbed = emb;
					break;
				}
			}

			if (!targetEmbed) targetEmbed = embeds[embeds.length - 1];

			var container =
				targetEmbed.closest('[id^="message-accessories-"]') ||
				targetEmbed.closest('[class*="container_b7e1cb"]') ||
				targetEmbed.closest('[class*="container_"]') ||
				targetEmbed.parentElement;
			return container || document;
		}

		function clearTayTuyNoticeEphemerals() {
			var btns = Array.from(
				document.querySelectorAll('button, [role="button"], a')
			).filter(function (b) {
				var t = (b.innerText || "").trim().toLowerCase();
				return (
					t === "bỏ qua tin nhắn" ||
					t === "bỏ qua tin" ||
					t === "dismiss message" ||
					t.includes("bỏ qua tin")
				);
			});

			btns.forEach(function (btn) {
				var msg =
					btn.closest('[class*="message_"]') ||
					btn.closest('[class*="container_"]') ||
					btn.parentElement;

				if (msg) {
					var txt = (msg.innerText || "").toLowerCase();
					var isNotice =
						txt.includes("chọn giữ lại thể chất cũ") ||
						txt.includes("phí tẩy tủy không được hoàn trả");

					var isMainEmbed =
						txt.includes("quản lý thể chất") ||
						txt.includes("kết quả tẩy tủy");

					if (isNotice && !isMainEmbed) {
						btn.click();
					}
				}
			});
		}

		async function loop() {
			if (!run || wait) return;

			clearTayTuyNoticeEphemerals();

			var scope = getTayTuyScope();
			var btns = Array.from(
				scope.querySelectorAll('button, a, [role="button"]')
			).filter(function (b) {
				if (b.disabled || !b.innerText) return false;
				var t = b.innerText.trim().toLowerCase();
				if (t.includes("bỏ qua tin") || t.includes("dismiss")) return false;
				return true;
			});

			var btnNhanMoi = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return t.includes("nhận mới");
			});

			var btnGiuCu = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return t.includes("giữ cũ");
			});

			if (btnNhanMoi || btnGiuCu) {
				var newPhysiqueName = "";
				if (btnNhanMoi) {
					var raw = btnNhanMoi.innerText.trim();
					var parts = raw.split(":");
					if (parts.length > 1) {
						newPhysiqueName = parts.slice(1).join(":").trim();
					} else {
						newPhysiqueName = raw;
					}
				}

				var isThanh = newPhysiqueName.toLowerCase().includes("thánh");

				if (isThanh) {
					run = false;
					updateStatus("STOP");
					lg(
						"🌟 BẮT ĐƯỢC THỂ CHẤT THÁNH: [ " +
							newPhysiqueName +
							" ]! TỰ ĐỘNG DỪNG MACRO!",
						"success"
					);
					return;
				} else {
					if (btnGiuCu) {
						wait = true;
						lg(
							"🛡️ Thể chất mới [ " +
								(newPhysiqueName || "Thường") +
								" ] không có 'Thánh' -> BẤM GIỮ CŨ!",
							"click"
						);
						btnGiuCu.click();
						await sleep(2000);
						wait = false;
						return;
					}
				}
			}

			var btnTayTuy = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return t.includes("tẩy tủy");
			});

			if (btnTayTuy) {
				wait = true;
				lg("🧬 NHẤN: " + btnTayTuy.innerText.trim(), "click");
				btnTayTuy.click();
				await sleep(2500);
				wait = false;
				return;
			}
		}

		window._taytuy = setInterval(loop, 1000);
		updateStatus("STOP");
		lg("🧬 BẢNG TẨY TỦY THỂ CHẤT MỞ (SẴN SÀNG - BẤM CHẠY)", "success");
	}

	function runBossSan() {
		if (window._bossSan) clearInterval(window._bossSan);

		var html =
			'<div class="bot-header" id="bsh">' +
			'<div class="bot-title"><span class="bot-dot" id="statusDotBS"></span>🗡️ SĂN BOSS BÍ CẢNH</div>' +
			'<div class="header-right">' +
			'<button id="bmbs" class="bot-btn" style="background:0 0;border:1px solid rgba(0,240,255,0.08);color:#00f0ff;font-size:14px;cursor:pointer;padding:0 6px;height:24px;">−</button>' +
			"</div></div>" +
			'<div class="bot-main-body" id="bsm" style="max-height:500px;">' +
			'<div class="btn-row" style="margin-bottom:6px;"><button class="bot-btn" id="btbs" style="flex:1;height:28px;font-size:10px;background:linear-gradient(135deg,#ff3b30,#ff2d55) !important;">▶️ CHẠY</button><button class="bot-btn" id="bxbs" style="height:28px;font-size:10px;padding:0 14px;">THOÁT</button></div>' +
			'<div class="bot-footer">' +
			'<div style="font-size:9px;color:#00f0ff;display:flex;justify-content:space-between;margin:4px 0 2px;font-weight:600;">' +
			'<span id="cdBossDisp">⌛ CD Boss: READY</span>' +
			'<span id="healStatusDisp">💚 Hồi Máu: READY</span>' +
			"</div>" +
			'<div class="bot-log" id="blbs" style="height:110px;font-size:10px;line-height:1.4;"></div>' +
			"</div></div>";

		var c = makeBot("bs", html, "#bsh", function () {
			mainMenu();
		});
		c.style.width = "310px";

		var log = $("#blbs");
		var main = $("#bsm");
		var min = $("#bmbs");
		var tog = $("#btbs");
		var dot = $("#statusDotBS");
		var cdBossDisp = $("#cdBossDisp");
		var healStatusDisp = $("#healStatusDisp");

		var run = false;
		var wait = false;
		var bossCDUntil = 0;
		var healedThisTurn = false;

		dot.className = "bot-dot yellow";

		function lg(t, type) {
			type = type || "";
			var time = new Date().toLocaleTimeString();
			log.innerHTML +=
				'<span class="log-time">[' +
				time +
				']</span> <span class="log-' +
				type +
				'">' +
				t +
				"</span>";
			if (log.childNodes.length > 15) log.removeChild(log.firstChild);
			log.scrollTop = log.scrollHeight;
		}

		function updateStatus(state) {
			dot.className = "bot-dot";
			if (state === "RUN") {
				dot.classList.add("green");
				tog.innerText = "STOP";
				tog.style.background = "linear-gradient(135deg,#4caf50,#2e7d32)";
			} else if (state === "STOP") {
				dot.classList.add("yellow");
				tog.innerText = "▶️ CHẠY";
				tog.style.background = "linear-gradient(135deg,#ff3b30,#ff2d55)";
			}
		}

		tog.onclick = function () {
			if (run) {
				run = false;
				updateStatus("STOP");
				lg("⏸️ DỪNG", "warn");
			} else {
				run = true;
				updateStatus("RUN");
				lg("▶️ CHẠY", "success");
			}
		};

		function isBossLobbyContainer(container) {
			if (!container) return false;
			var txt = (container.innerText || "").toLowerCase();

			var hasBossKeywords =
				txt.includes("sinh mệnh") ||
				txt.includes("nhật ký chiến đấu") ||
				txt.includes("tấn công boss") ||
				txt.includes("rời sảnh") ||
				txt.includes("sát lực") ||
				txt.includes("ngự thủ") ||
				txt.includes("giai đoạn");

			var btns = Array.from(
				container.querySelectorAll('button, a, [role="button"]'),
			).map(function (b) {
				return (b.innerText || "").trim().toLowerCase();
			});

			var hasTanCong = btns.some(function (t) {
				return (
					t.includes("tấn công boss") ||
					t.includes("tấn công") ||
					t.includes("khiêu chiến")
				);
			});
			var hasHoiMau = btns.some(function (t) {
				return t.includes("hồi máu") || t.includes("hồimáu");
			});
			var hasRoiSanh = btns.some(function (t) {
				return t.includes("rời sảnh") || t.includes("rờisảnh");
			});

			return hasBossKeywords || (hasHoiMau && hasRoiSanh) || hasTanCong;
		}

		function getBossScope() {
			var embeds = Array.from(
				document.querySelectorAll(
					'article[class*="__623de"], [class*="embedFull"], [class*="markup_"]',
				),
			);
			if (!embeds.length) return document;

			var targetEmbed = null;
			for (var i = embeds.length - 1; i >= 0 && i >= embeds.length - 5; i--) {
				var emb = embeds[i];
				var txt = (emb.innerText || "").toLowerCase();
				if (
					txt.includes("sinh mệnh") ||
					txt.includes("nhật ký chiến đấu") ||
					txt.includes("tấn công boss") ||
					txt.includes("rời sảnh") ||
					txt.includes("sảnh boss") ||
					txt.includes("trở lại sảnh") ||
					txt.includes("bỏ qua animation")
				) {
					targetEmbed = emb;
					break;
				}
			}

			if (!targetEmbed) targetEmbed = embeds[embeds.length - 1];

			var container =
				targetEmbed.closest('[id^="message-accessories-"]') ||
				targetEmbed.closest('[class*="container_b7e1cb"]') ||
				targetEmbed.closest('[class*="container_"]') ||
				targetEmbed.parentElement;
			return container || document;
		}

		function clearBossHealEphemerals() {
			var btns = Array.from(
				document.querySelectorAll('button, [role="button"], a'),
			).filter(function (b) {
				var t = (b.innerText || "").trim().toLowerCase();
				return (
					t === "bỏ qua tin nhắn" ||
					t === "bỏ qua tin" ||
					t === "dismiss message" ||
					t === "xóa tin nhắn" ||
					t.includes("bỏ qua tin")
				);
			});

			btns.forEach(function (btn) {
				var msg =
					btn.closest('[class*="message_"]') ||
					btn.closest('[class*="container_"]') ||
					btn.parentElement;

				if (msg) {
					var txt = (msg.innerText || "").toLowerCase();

					var isHealNotice =
						txt.includes("hồi máu") ||
						txt.includes("sinh lực") ||
						txt.includes("hồi phục") ||
						txt.includes("thể lực") ||
						txt.includes("nghỉ ngơi") ||
						txt.includes("tấn công tiếp") ||
						txt.includes("tự động hồi") ||
						txt.includes("hp hiện tại:");

					var isLobby = isBossLobbyContainer(msg);

					if (isHealNotice && !isLobby) {
						btn.click();
					}
				}
			});
		}

		async function loop() {
			if (!run || wait) return;

			clearBossHealEphemerals();

			var scope = getBossScope();
			var now = Date.now();

			if (bossCDUntil > now) {
				var secLeft = Math.ceil((bossCDUntil - now) / 1000);
				cdBossDisp.innerText = "⌛ CD Boss: " + secLeft + "s";
			} else {
				cdBossDisp.innerText = "⌛ CD Boss: READY";
			}

			healStatusDisp.innerText = healedThisTurn
				? "💚 Hồi Máu: ĐÃ HỒI"
				: "💚 Hồi Máu: CHƯA HỒI";

			var btns = Array.from(
				scope.querySelectorAll('button, a, [role="button"]'),
			).filter(function (b) {
				if (b.disabled || !b.innerText) return false;
				var t = b.innerText.trim().toLowerCase();
				if (
					t.includes("bỏ qua tin") ||
					t.includes("dismiss") ||
					t.includes("rời sảnh") ||
					t.includes("rờisảnh")
				) {
					return false;
				}
				return true;
			});

			var btnChuaXuatHien = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return t.includes("chưa xuất hiện") || t.includes("chưa xuất");
			});

			var btnNhanThuong = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return (
					t.includes("nhận thưởng") ||
					t.includes("nhận phần thưởng") ||
					t.includes("lãnh thưởng")
				);
			});

			if (btnNhanThuong) {
				wait = true;
				lg("🎁 NHẤN: Nhận Thưởng (Boss đã bị đánh bại)", "success");
				btnNhanThuong.click();
				await sleep(2500);
				run = false;
				updateStatus("STOP");
				lg("🏆 BOSS ĐÃ BỊ ĐÁNH BẠI - ĐÃ NHẬN THƯỞNG & DỪNG MACRO!", "success");
				wait = false;
				return;
			}

			if (btnChuaXuatHien) {
				run = false;
				updateStatus("STOP");
				lg("🛑 PHÁT HIỆN 'CHƯA XUẤT HIỆN': DỪNG TẮT MACRO BOSS!", "warn");
				return;
			}

			var btnSanhBoss = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return (
					t.includes("sảnh boss") ||
					t.includes("trở lại sảnh") ||
					t.includes("quay lại sảnh")
				);
			});

			if (btnSanhBoss) {
				wait = true;
				lg("🏰 NHẤN: Sảnh Boss (Bỏ qua tổng kết)", "click");
				btnSanhBoss.click();
				healedThisTurn = false;
				bossCDUntil = Date.now() + 29000;
				await sleep(2500);
				wait = false;
				return;
			}

			var btnBoQuaAnimation = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return t.includes("bỏ qua animation") || t.includes("bỏ qua ani");
			});

			if (btnBoQuaAnimation && !btnSanhBoss) {
				wait = true;
				lg("⚡ NHẤN: Bỏ qua animation", "click");
				btnBoQuaAnimation.click();
				await sleep(1500);
				wait = false;
				return;
			}

			var btnHoiMau = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return (
					t.includes("hồi máu") ||
					t.includes("hồimáu") ||
					t.includes("hồi phục")
				);
			});

			var btnAttack = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return (
					t.includes("tấn công boss") ||
					t.includes("tấn công") ||
					t.includes("khiêu chiến") ||
					t.includes("công kích") ||
					t.includes("đánh boss")
				);
			});

			if (btnHoiMau && !healedThisTurn) {
				wait = true;
				lg("💚 NHẤN: Hồi Máu", "click");
				btnHoiMau.click();
				healedThisTurn = true;
				await sleep(2500);
				wait = false;
				return;
			}

			if (btnAttack && healedThisTurn) {
				if (bossCDUntil > now) {
					return;
				}
				wait = true;
				lg("⚔️ NHẤN: " + btnAttack.innerText.trim(), "click");
				bossCDUntil = Date.now() + 29000;
				btnAttack.click();
				await sleep(2500);
				wait = false;
				return;
			}
		}

		window._bossSan = setInterval(loop, 1000);
		updateStatus("STOP");
		lg("🗡️ BẢNG SĂN BOSS MỞ (SẴN SÀNG - BẤM CHẠY)", "success");
	}

	function runKimCuong() {
		if (window._kimcuong) clearInterval(window._kimcuong);
		var c = makeBot(
			"bk",
			'<div class="bot-header" id="bkh"><div class="bot-title"><span class="bot-dot" id="statusDotK"></span>💎 KIM CƯƠNG THẦN ĐIỆN</div><div class="header-right"><div class="bc-delay-block">⏱️Delay<input type="number" id="kdel" value="2000" min="200" step="100" class="bc-input-ms"><span>ms</span></div><div class="bc-delay-block" title="Giới hạn số lần đi (0 = Vô hạn)">🎯Lần<input type="number" id="klim" value="0" min="0" step="1" class="bc-input-ms" style="width:24px;"></div><button id="bmk" class="bot-btn" style="background:0 0;border:1px solid rgba(0,240,255,0.08);color:#00f0ff;font-size:14px;cursor:pointer;padding:0 6px;height:24px;">−</button></div></div><div class="bot-main-body" id="bkm"><div class="btn-row"><button class="bot-btn off" id="bhealK">💊 HỒI TOÀN ĐỘI</button><button class="bot-btn" id="btk">STOP</button><button class="bot-btn" id="bxk">THOÁT</button></div><div class="bot-footer"><div class="bot-log" id="blk"></div></div></div>',
			"#bkh",
			function () {
				menuLuyenHu();
			},
		);

		var log = $("#blk");
		var main = $("#bkm");
		var min = $("#bmk");
		var tog = $("#btk");
		var del = $("#kdel");
		var lim = $("#klim");
		var healBtn = $("#bhealK");
		var dot = $("#statusDotK");
		var run = true;
		var delay = 2000;
		var maxRuns = 0;
		var runCount = 0;
		var mini = false;
		var wait = false;
		var healMode = false;
		var isHealing = false;
		var startClickCount = 0;
		var lastActionName = "";
		var actionClickCount = 0;
		var noButtonTickCount = 0;

		dot.className = "bot-dot green";
		min.onclick = function (e) {
			e.stopPropagation();
			mini = !mini;
			main.classList.toggle("c", mini);
			min.textContent = mini ? "+" : "−";
		};

		function lg(t, type) {
			type = type || "";
			var time = new Date().toLocaleTimeString();
			log.innerHTML +=
				'<span class="log-time">[' +
				time +
				']</span> <span class="log-' +
				type +
				'">' +
				t +
				"</span>";
			if (log.childNodes.length > 15) log.removeChild(log.firstChild);
			log.scrollTop = log.scrollHeight;
		}

		var lastActionTime = 0;

		function getKCContainer() {
			var embeds = Array.from(
				document.querySelectorAll(
					'article[class*="__623de"], [class*="embedFull"], [class*="embedWrapper"]',
				),
			);
			if (embeds.length > 0) {
				var targetEmbed = embeds[embeds.length - 1];
				var container =
					targetEmbed.closest('li[id^="chat-messages-"]') ||
					targetEmbed.closest('[class*="messageListItem"]') ||
					targetEmbed.closest('[id^="message-accessories-"]') ||
					targetEmbed.closest('[class*="container_b7e1cb"]') ||
					targetEmbed.closest('[class*="container_"]') ||
					targetEmbed.parentElement;
				if (container) return container;
			}

			var msgs = Array.from(
				document.querySelectorAll(
					'li[id^="chat-messages-"], [class*="messageListItem"]',
				),
			);
			for (var i = msgs.length - 1; i >= Math.max(0, msgs.length - 2); i--) {
				var m = msgs[i];
				if (m.querySelector('[class*="actionRow"], [id^="message-accessories-"], [class*="container_"]')) {
					return m;
				}
			}

			return null;
		}

		function parseKimCuongStacks(scope) {
			if (!scope) return 0;
			var txt = scope.innerText || "";
			var m =
				txt.match(/Kim\s*Cương\s*Chi\s*Lực:\s*.*?(\d+)\s*\/\s*3/i) ||
				txt.match(/(\d+)\s*\/\s*3\s*Tầng/i);
			if (m && m[1] !== undefined) {
				var v = parseInt(m[1], 10);
				if (!isNaN(v)) return v;
			}
			return 0;
		}

		function parseTeamHealth(scope) {
			if (!scope) return { total: 0, lowHpCount: 0, isCritical: false };
			var txt = scope.innerText || "";
			var lines = txt.split("\n");
			var members = [];
			var inTeamSection = false;

			for (var i = 0; i < lines.length; i++) {
				var line = lines[i].trim();
				if (line.includes("TRẠNG THÁI TỔ ĐỘI")) {
					inTeamSection = true;
					continue;
				}
				if (inTeamSection) {
					if (!line.includes("•") && members.length > 0) {
						break;
					}
					if (members.length >= 5) {
						break;
					}

					var match = line.match(/(\d+)\s*\/\s*(\d+)/);
					if (match) {
						var curr = parseInt(match[1], 10);
						var max = parseInt(match[2], 10);
						if (!isNaN(curr) && !isNaN(max) && max > 0 && curr <= max) {
							var pct = (curr / max) * 100;
							members.push({ curr: curr, max: max, pct: pct });
						}
					}
				}
			}

			var totalMembers = Math.min(5, members.length);
			var lowHpCount = 0;
			for (var j = 0; j < totalMembers; j++) {
				if (members[j].pct < 20) {
					lowHpCount++;
				}
			}

			var isCritical = false;
			if (totalMembers >= 5) isCritical = lowHpCount >= 4;
			else if (totalMembers === 4) isCritical = lowHpCount >= 3;
			else if (totalMembers === 3) isCritical = lowHpCount >= 2;
			else if (totalMembers === 2) isCritical = lowHpCount >= 1;
			else if (totalMembers === 1) isCritical = lowHpCount >= 1;

			return {
				total: totalMembers,
				lowHpCount: lowHpCount,
				isCritical: isCritical,
			};
		}

		async function autoHealTeamK() {
			if (!healMode || isHealing) return false;
			isHealing = true;
			lg("💊 ĐANG HỒI TOÀN ĐỘI...", "click");
			healBtn.className = "bot-btn on";
			healBtn.innerText = "💊 ĐANG HỒI...";

			var scope = getKCContainer();
			var searchRoot = scope || document;

			var hf = Array.from(
				searchRoot.querySelectorAll('button, a, [role="button"]'),
			).find(function (x) {
				var t = (x.innerText || x.textContent || "").trim().toLowerCase();
				return (
					t.includes("hồi toàn đội") ||
					t.includes("hồi máu") ||
					t.includes("hồi đội")
				);
			});

			if (hf) {
				hf.click();
				lg("✅ HỒI TOÀN ĐỘI LẦN 1", "success");
				await sleep(500);
				hf.click();
				lg("✅ HỒI TOÀN ĐỘI LẦN 2", "success");
				await sleep(600);

				var st = null;
				for (var attempt = 0; attempt < 3; attempt++) {
					var currentScope = getKCContainer() || document;
					st = Array.from(
						currentScope.querySelectorAll('button, a, [role="button"]'),
					).find(function (x) {
						var t = (x.innerText || x.textContent || "").trim().toLowerCase();
						return (
							t.includes("bắt đầu") ||
							t.includes("bắtđầu") ||
							t.includes("khởi hành") ||
							t.includes("khám phá")
						);
					});
					if (st) break;
					await sleep(400);
				}

				if (st) {
					st.click();
					lg("✅ BẮT ĐẦU", "success");
					healBtn.className = "bot-btn on";
					healBtn.innerText = "💊 HỒI TOÀN ĐỘI";
					isHealing = false;
					return true;
				} else {
					lg("⚠️ KHÔNG THẤY BẮT ĐẦU", "warn");
					healBtn.className = "bot-btn on";
					healBtn.innerText = "💊 HỒI TOÀN ĐỘI";
					isHealing = false;
					return false;
				}
			} else {
				lg("⚠️ KHÔNG THẤY HỒI TOÀN ĐỘI", "warn");
				isHealing = false;
				return false;
			}
		}

		healBtn.onclick = function (e) {
			e.stopPropagation();
			healMode = !healMode;
			if (healMode) {
				healBtn.className = "bot-btn on";
				healBtn.innerText = "💊 HỒI TOÀN ĐỘI";
				lg("🔴 HỒI TOÀN ĐỘI: BẬT", "click");
			} else {
				healBtn.className = "bot-btn off";
				healBtn.innerText = "💊 HỒI TOÀN ĐỘI";
				lg("⚪ HỒI TOÀN ĐỘI: TẮT", "warn");
			}
		};

		function updateStatus(state) {
			dot.className = "bot-dot";
			if (state === "RUN") {
				dot.classList.add("green");
				tog.innerText = "STOP";
				tog.style.background = "linear-gradient(135deg,#f9d423,#f83600)";
			} else if (state === "STOP") {
				dot.classList.add("yellow");
				tog.innerText = "RUN";
				tog.style.background = "linear-gradient(135deg,#4caf50,#2e7d32)";
			} else if (state === "PAUSE") {
				dot.classList.add("red");
				tog.innerText = "RUN";
				tog.style.background = "linear-gradient(135deg,#ff6b35,#f7931e)";
			}
		}

		tog.onclick = function () {
			if (run) {
				run = false;
				updateStatus("STOP");
				lg("⏸️ DỪNG", "warn");
			} else {
				if (maxRuns > 0 && runCount >= maxRuns) {
					runCount = 0;
					lg("🔄 RESET ĐẾM SỐ LẦN ĐI (0/" + maxRuns + ")", "click");
				}
				run = true;
				updateStatus("RUN");
				lg("▶️ CHẠY", "success");
			}
		};

		del.oninput = function () {
			var v = parseInt(del.value) || 2000;
			delay = Math.max(200, v);
		};

		lim.oninput = function () {
			var v = parseInt(lim.value) || 0;
			maxRuns = Math.max(0, v);
			if (maxRuns > 0) {
				lg("🎯 GIỚI HẠN: " + maxRuns + " LẦN (Đã đi: " + runCount + "/" + maxRuns + ")", "click");
			} else {
				lg("🎯 GIỚI HẠN: VÔ HẠN (0)", "warn");
			}
		};

		var exitBtn = $("#bxk");
		if (exitBtn) {
			exitBtn.onclick = function (e) {
				e.stopPropagation();
				if (window._kimcuong) clearInterval(window._kimcuong);
				c.remove();
				menuLuyenHu();
			};
		}

		function checkError(scope) {
			if (!scope) return false;
			var staErr = checkTeamStamina(scope);
			if (staErr && staErr.hasError) {
				if (run) {
					run = false;
					updateStatus("PAUSE");
					lg("⚠️ " + staErr.reason, "error");
					return true;
				}
			}
			return false;
		}

		var kyNgoEvents = [
			{
				name: "Kim Cương Khoáng Mạch",
				optA: ["cưỡng ép khai thác", "khai thác"],
				optB: ["hấp thu linh tinh", "linh tinh"],
			},
			{
				name: "Thạch Nhân Trận",
				optA: ["cường lực phá trận"],
				optB: ["giữ sức tránh né", "tránh né"],
			},
			{
				name: "Thần Khố Bị Niêm Phong",
				optA: ["cưỡng ép phá khóa", "phá khóa"],
				optB: ["nhặt cổ linh thạch", "linh thạch"],
			},
			{
				name: "Phong Ấn Thần Điện",
				optA: ["cưỡng ép phá trận"],
				optB: ["giữ nguyên phong ấn", "phong ấn"],
			},
			{
				name: "Bí Trụ Thần Ma",
				optA: ["tiếp nhận thần uy", "thần uy"],
				optB: ["quan sát từ xa", "quan sát"],
			},
			{
				name: "Kim Cương Phù Điêu",
				optA: ["cưỡng ép ngộ đạo", "ngộ đạo"],
				optB: ["tĩnh tâm hồi khí", "hồi khí"],
			},
			{
				name: "Bí Trụ Thái Cổ",
				optA: ["giao thoa thần quang", "thần quang"],
				optB: ["thần quan tẩy lễ", "tẩy lễ"],
			},
			{
				name: "Luyện Khí Đài Thái Cổ",
				optA: ["tôi luyện thân thể", "tôi luyện"],
				optB: ["tôi luyện thân thể", "tôi luyện"],
			},
			{
				name: "Phù Văn Mê Cung",
				optA: ["cưỡng ép giải trận", "giải trận"],
				optB: ["tạ từ mê cung", "tạ từ", "mê cung"],
			},
		];

		var singleEvents = [
			"giao thoa khí linh",
			"tôi hỏa bất tử",
			"tắm tụ linh trì",
			"cưỡng cầu tiên đan",
			"tôi luyện thân thể",
			"tôi luyện",
			"cưỡng ép giải trận",
		];

		async function loop() {
			if (!run || wait || isHealing) return;
			skipMessage();

			var scope = getKCContainer();
			if (checkError(scope)) return;
			if (!scope) return;

			var rawBtns = Array.from(
				scope.querySelectorAll('[class*="actionRow"] button, [id^="message-accessories-"] button, [class*="container_"] button, button[class*="component"], [role="button"][class*="component"]')
			);

			if (!rawBtns.length) {
				rawBtns = Array.from(scope.querySelectorAll('button, [role="button"]'));
			}

			var btns = rawBtns.filter(function (b) {
				if (b.disabled || b.getAttribute("aria-disabled") === "true") return false;

				var aria = (b.getAttribute("aria-label") || "").toLowerCase();
				if (
					aria.includes("reaction") ||
					aria.includes("phản ứng") ||
					aria.includes("reply") ||
					aria.includes("trả lời") ||
					aria.includes("more") ||
					aria.includes("khác") ||
					aria.includes("pin") ||
					aria.includes("ghim") ||
					aria.includes("emoji") ||
					aria.includes("gif") ||
					aria.includes("sticker") ||
					aria.includes("gift") ||
					aria.includes("app")
				) {
					return false;
				}

				if (b.hasAttribute("data-mana-component")) return false;

				var t = (b.innerText || b.textContent || "").trim().toLowerCase();
				if (!t) return false;
				if (
					t.includes("bỏ qua tin") ||
					t.includes("dismiss") ||
					t.includes("rời đội") ||
					t.includes("cuộc trò chuyện") ||
					t.includes("tìm hoặc") ||
					t.includes("trò chuyện")
				) {
					return false;
				}
				return true;
			});

			function trackActionAndCheckLag(actionName) {
				if (lastActionName === actionName) {
					actionClickCount++;
				} else {
					lastActionName = actionName;
					actionClickCount = 1;
				}

				if (actionClickCount >= 4) {
					var homeBtn = findHomeBiCanhButton();
					if (homeBtn) {
						wait = true;
						lg("🚨 KẸT ẢI (" + lastActionName + " x" + actionClickCount + ") -> BẤM 'BÍ CẢNH' Ở TRANG CHỦ!", "warn");
						homeBtn.click();
						actionClickCount = 0;
						lastActionName = "";
						startClickCount = 0;
						return true;
					} else {
						run = false;
						updateStatus("PAUSE");
						lg("⚠️ KẸT ẢI (" + lastActionName + " x" + actionClickCount + ") NHƯNG KHÔNG TÌM THẤY ENTRY 'BÍ CẢNH' TRANG CHỦ (TRONG 8 TIN GẦN NHẤT) -> TẠM DỪNG!", "error");
						actionClickCount = 0;
						lastActionName = "";
						return true;
					}
				}
				return false;
			}

			if (!btns.length) {
				noButtonTickCount++;
				if (noButtonTickCount >= 4) {
					var homeBtn = findHomeBiCanhButton();
					if (homeBtn) {
						wait = true;
						lg("🚨 GIAO DIỆN TREO KHÔNG NÚT (>4s) -> BẤM 'BÍ CẢNH' Ở TRANG CHỦ!", "warn");
						homeBtn.click();
						noButtonTickCount = 0;
						actionClickCount = 0;
						lastActionName = "";
						startClickCount = 0;
						await sleep(3000 + jitter);
						wait = false;
						return;
					} else {
						run = false;
						updateStatus("PAUSE");
						lg("⚠️ GIAO DIỆN TREO KHÔNG NÚT (>4s) & KHÔNG TÌM THẤY ENTRY 'BÍ CẢNH' TRANG CHỦ (TRONG 8 TIN GẦN NHẤT) -> TẠM DỪNG!", "error");
						noButtonTickCount = 0;
						return;
					}
				}
				return;
			}
			noButtonTickCount = 0;

			var jitter = Math.floor(Math.random() * 200);

			var btnKetQua = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return t.includes("kết quả nhanh") || t.includes("xem kết quả");
			});
			if (btnKetQua) {
				if (trackActionAndCheckLag("KẾT QUẢ NHANH")) {
					await sleep(3000 + jitter);
					wait = false;
					return;
				}
				wait = true;
				lg("📊 NHẤN: " + btnKetQua.innerText.trim() + (actionClickCount > 1 ? " (Lần " + actionClickCount + ")" : ""), "click");
				btnKetQua.click();
				await sleep(1500);
				wait = false;
				return;
			}

			var btnChienTiep = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return t.includes("chiến tiếp");
			});
			if (btnChienTiep) {
				startClickCount = 0;
				actionClickCount = 0;
				lastActionName = "";
				runCount++;
				lg("🏁 HOÀN THÀNH LƯỢT " + runCount + (maxRuns > 0 ? "/" + maxRuns : ""), "success");
				if (maxRuns > 0 && runCount >= maxRuns) {
					wait = true;
					lg("✅ NHẤN: " + btnChienTiep.innerText.trim(), "click");
					btnChienTiep.click();
					run = false;
					updateStatus("STOP");
					lg("🛑 ĐÃ HOÀN THÀNH ĐỦ " + maxRuns + " LẦN ĐI -> TỰ ĐỘNG DỪNG AUTO!", "warn");
					wait = false;
					return;
				}
				wait = true;
				lg("✅ NHẤN: " + btnChienTiep.innerText.trim(), "click");
				btnChienTiep.click();
				lg("⏳ DỪNG 3S TRƯỚC KHI HỒI...", "warn");
				await sleep(3000);
				if (healMode) {
					lg("💊 THỰC HIỆN HỒI TOÀN ĐỘI...", "click");
					await autoHealTeamK();
				} else {
					lg("⚪ HỒI TOÀN ĐỘI ĐANG TẮT, BỎ QUA", "warn");
				}
				wait = false;
				return;
			}

			var btnTiepTuc = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return t.includes("tiếp tục");
			});
			if (btnTiepTuc) {
				if (trackActionAndCheckLag("TIẾP TỤC")) {
					await sleep(3000 + jitter);
					wait = false;
					return;
				}
				startClickCount = 0;
				wait = true;
				lg("⏩ TIẾP TỤC ẢI: " + btnTiepTuc.innerText.trim() + (actionClickCount > 1 ? " (Lần " + actionClickCount + ")" : ""), "click");
				btnTiepTuc.click();
				await sleep(delay + jitter);
				wait = false;
				return;
			}

			var combatKeywords = [
				"khai chiến",
				"khiêu chiến",
				"chiến đấu",
				"vào trận",
				"tiến vào",
				"tấn công",
				"bắt đầu đánh",
				"khai trận",
			];
			var btnKhaiChien = btns.find(function (b) {
				var t = (b.innerText || b.textContent || "").trim().toLowerCase();
				return combatKeywords.some(function (k) {
					return t.includes(k);
				});
			});
			if (btnKhaiChien) {
				if (trackActionAndCheckLag("KHAI CHIẾN")) {
					await sleep(3000 + jitter);
					wait = false;
					return;
				}
				var now = Date.now();
				if (now - lastActionTime < 3500) {
					return;
				}
				wait = true;
				lastActionTime = now;
				lg("⚔️ NHẤN: " + (btnKhaiChien.innerText || btnKhaiChien.textContent || "").trim() + (actionClickCount > 1 ? " (Lần " + actionClickCount + ")" : ""), "click");
				btnKhaiChien.click();
				await sleep(2500 + jitter);
				wait = false;
				return;
			}

			var singleBtn = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return singleEvents.some(function (ev) {
					return t.includes(ev);
				});
			});

			if (singleBtn) {
				if (trackActionAndCheckLag("KỲ NGỘ: " + singleBtn.innerText.trim())) {
					await sleep(3000 + jitter);
					wait = false;
					return;
				}
				wait = true;
				lg("✨ NHẤN KỲ NGỘ: " + singleBtn.innerText.trim() + (actionClickCount > 1 ? " (Lần " + actionClickCount + ")" : ""), "click");
				singleBtn.click();
				await sleep(delay + jitter);
				wait = false;
				return;
			}

			var stacks = parseKimCuongStacks(scope);
			var hpInfo = parseTeamHealth(scope);
			var useOptionB = hpInfo.isCritical || stacks >= 3;

			for (var k = 0; k < kyNgoEvents.length; k++) {
				var ev = kyNgoEvents[k];
				var btnA = btns.find(function (b) {
					var t = b.innerText.trim().toLowerCase();
					return ev.optA.some(function (kw) {
						return t.includes(kw);
					});
				});
				var btnB = btns.find(function (b) {
					var t = b.innerText.trim().toLowerCase();
					return ev.optB.some(function (kw) {
						return t.includes(kw);
					});
				});

				if (btnA || btnB) {
					var chosenBtn = null;
					if (useOptionB && btnB) {
						chosenBtn = btnB;
					} else if (btnA) {
						chosenBtn = btnA;
					} else if (btnB) {
						chosenBtn = btnB;
					}

					if (chosenBtn) {
						if (trackActionAndCheckLag("KỲ NGỘ: " + chosenBtn.innerText.trim())) {
							await sleep(3000 + jitter);
							wait = false;
							return;
						}
						wait = true;
						lg("💎 NHẤN: " + chosenBtn.innerText.trim() + (actionClickCount > 1 ? " (Lần " + actionClickCount + ")" : ""), "click");
						chosenBtn.click();
						await sleep(delay + jitter);
						wait = false;
						return;
					}
				}
			}

			var targetGate = null;
			var pList = ["sinh", "hưu", "cảnh", "khai", "thương", "kinh"];
			for (var i = 0; i < pList.length; i++) {
				var p = pList[i];
				targetGate = btns.find(function (b) {
					return (
						b.innerText.toLowerCase().includes(p) && b.innerText.includes("[")
					);
				});
				if (targetGate) break;
			}
			if (targetGate) {
				if (trackActionAndCheckLag("CỔNG BÁT MÔN: " + targetGate.innerText.trim())) {
					await sleep(3000 + jitter);
					wait = false;
					return;
				}
				wait = true;
				lg("🚪 NHẤN CỔNG: " + targetGate.innerText.trim() + (actionClickCount > 1 ? " (Lần " + actionClickCount + ")" : ""), "click");
				targetGate.click();
				await sleep(delay + jitter);
				wait = false;
				return;
			}

			var btnStart = btns.find(function (b) {
				var t = (b.innerText || b.textContent || "").trim().toLowerCase();
				return (
					(t === "bắt đầu" || t.startsWith("bắt đầu") || t.includes("bắt đầu") || t.includes("khởi hành") || t.includes("khám phá")) &&
					!t.includes("cuộc trò chuyện") &&
					!t.includes("tìm hoặc") &&
					!t.includes("trò chuyện")
				);
			});
			if (btnStart) {
				if (maxRuns > 0 && runCount >= maxRuns) {
					run = false;
					updateStatus("STOP");
					lg("🛑 ĐÃ ĐẠT GIỚI HẠN " + maxRuns + " LẦN ĐI -> DỪNG AUTO!", "warn");
					return;
				}

				startClickCount++;
				if (startClickCount >= 4) {
					var homeBtn = findHomeBiCanhButton();
					if (homeBtn) {
						wait = true;
						lg("🚨 SẢNH KẸT BẮT ĐẦU " + startClickCount + " LẦN -> BẤM 'BÍ CẢNH' Ở TRANG CHỦ!", "warn");
						homeBtn.click();
						startClickCount = 0;
						actionClickCount = 0;
						lastActionName = "";
						await sleep(3000 + jitter);
						wait = false;
						return;
					} else {
						run = false;
						updateStatus("PAUSE");
						lg("⚠️ SẢNH KẸT BẮT ĐẦU " + startClickCount + " LẦN & KHÔNG TÌM THẤY ENTRY 'BÍ CẢNH' TRANG CHỦ (TRONG 8 TIN GẦN NHẤT) -> TẠM DỪNG!", "error");
						startClickCount = 0;
						return;
					}
				}

				if (startClickCount >= 3) {
					var btnRefreshNow = btns.find(function (b) {
						var t = (b.innerText || b.textContent || "").trim().toLowerCase();
						return (
							t.includes("làm mới") ||
							t.includes("làmmới") ||
							t.includes("cập nhật") ||
							t.includes("refresh")
						);
					});
					if (btnRefreshNow) {
						wait = true;
						lg("🔄 ĐÃ BẤM BẮT ĐẦU " + startClickCount + " LẦN CHƯA PHẢN HỒI -> BẤM LÀM MỚI SẢNH!", "warn");
						btnRefreshNow.click();
						startClickCount = 0;
						await sleep(delay + jitter);
						wait = false;
						return;
					}
				}

				wait = true;
				lg("✅ BẮT ĐẦU" + (startClickCount > 1 ? " (Lần " + startClickCount + ")" : ""), "click");
				btnStart.click();
				await sleep(delay + jitter);
				wait = false;
				return;
			}

			var btnRefresh = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return (
					t.includes("làm mới") ||
					t.includes("làmmới") ||
					t.includes("cập nhật") ||
					t.includes("refresh")
				);
			});
			if (btnRefresh) {
				wait = true;
				lg(
					"🔄 NHẤN: " +
						btnRefresh.innerText.trim() +
						" (Tự động hiện lại nút Bắt đầu)",
					"click",
				);
				btnRefresh.click();
				await sleep(delay + jitter);
				wait = false;
				return;
			}
		}

		window._kimcuong = setInterval(loop, 1000);
		updateStatus("RUN");
		lg("💎 KHỞI ĐỘNG KIM CƯƠNG THẦN ĐIỆN", "success");
		lg("⚪ HỒI TOÀN ĐỘI: TẮT", "warn");
	}

	function runStandardBC(config) {
		var id = config.id || "b2";
		var title = config.title || "⚔️ BÍ CẢNH";
		var colorGrad =
			config.colorGrad || "linear-gradient(135deg,#ff3b30,#ff2d55)";
		var intervalKey = config.intervalKey || "_bc";
		var onExit = config.onExit || mainMenu;

		if (window[intervalKey]) clearInterval(window[intervalKey]);
		var c = makeBot(
			id,
			'<div class="bot-header" id="' +
				id +
				'h"><div class="bot-title"><span class="bot-dot" id="statusDot' +
				id +
				'"></span>' +
				title +
				'</div><div class="header-right"><div class="bc-delay-block">⏱️Delay<input type="number" id="' +
				id +
				'del" value="2000" min="200" step="100" class="bc-input-ms"><span>ms</span></div><div class="bc-delay-block" title="Giới hạn số lần đi (0 = Vô hạn)">🎯Lần<input type="number" id="' +
				id +
				'lim" value="0" min="0" step="1" class="bc-input-ms" style="width:24px;"></div><button id="bm' +
				id +
				'" class="bot-btn" style="background:0 0;border:1px solid rgba(0,240,255,0.08);color:#00f0ff;font-size:14px;cursor:pointer;padding:0 6px;height:24px;">−</button></div></div><div class="bot-main-body" id="' +
				id +
				'm"><div class="btn-row"><button class="bot-btn off" id="bheal' +
				id +
				'">💊 HỒI TOÀN ĐỘI</button><button class="bot-btn" id="bt' +
				id +
				'">STOP</button><button class="bot-btn" id="bx' +
				id +
				'">THOÁT</button></div><div class="bot-footer"><div class="bot-log" id="bl' +
				id +
				'"></div></div></div>',
			"#" + id + "h",
			onExit,
		);

		var log = $("#bl" + id);
		var main = $("#" + id + "m");
		var min = $("#bm" + id);
		var tog = $("#bt" + id);
		var del = $("#" + id + "del");
		var lim = $("#" + id + "lim");
		var healBtn = $("#bheal" + id);
		var dot = $("#statusDot" + id);
		var run = true;
		var delay = 2000;
		var maxRuns = 0;
		var runCount = 0;
		var mini = false;
		var wait = false;
		var healMode = false;
		var isHealing = false;
		var startClickCount = 0;
		var lastActionName = "";
		var actionClickCount = 0;
		var noButtonTickCount = 0;

		dot.className = "bot-dot green";
		min.onclick = function (e) {
			e.stopPropagation();
			mini = !mini;
			main.classList.toggle("c", mini);
			min.textContent = mini ? "+" : "−";
		};

		function lg(t, type) {
			type = type || "";
			var time = new Date().toLocaleTimeString();
			log.innerHTML +=
				'<span class="log-time">[' +
				time +
				']</span> <span class="log-' +
				type +
				'">' +
				t +
				"</span>";
			if (log.childNodes.length > 15) log.removeChild(log.firstChild);
			log.scrollTop = log.scrollHeight;
		}

		async function autoHealTeamStandard() {
			if (!healMode || isHealing) return false;
			isHealing = true;
			lg("💊 ĐANG HỒI TOÀN ĐỘI...", "click");
			healBtn.className = "bot-btn on";
			healBtn.innerText = "💊 ĐANG HỒI...";

			var scope = getStandardBCScope();
			var searchRoot = scope || document;

			var hf = Array.from(
				searchRoot.querySelectorAll('button, a, [role="button"]'),
			).find(function (x) {
				var t = (x.innerText || x.textContent || "").trim().toLowerCase();
				return (
					t.includes("hồi toàn đội") ||
					t.includes("hồi máu") ||
					t.includes("hồi đội")
				);
			});

			if (hf) {
				hf.click();
				lg("✅ HỒI TOÀN ĐỘI LẦN 1", "success");
				await sleep(500);
				hf.click();
				lg("✅ HỒI TOÀN ĐỘI LẦN 2", "success");
				await sleep(600);

				var st = null;
				for (var attempt = 0; attempt < 3; attempt++) {
					var currentScope = getStandardBCScope() || document;
					st = Array.from(
						currentScope.querySelectorAll('button, a, [role="button"]'),
					).find(function (x) {
						var t = (x.innerText || x.textContent || "").trim().toLowerCase();
						return (
							t.includes("bắt đầu") ||
							t.includes("bắtđầu") ||
							t.includes("khởi hành") ||
							t.includes("khám phá")
						);
					});
					if (st) break;
					await sleep(400);
				}

				if (st) {
					st.click();
					lg("✅ BẮT ĐẦU", "success");
					healBtn.className = "bot-btn on";
					healBtn.innerText = "💊 HỒI TOÀN ĐỘI";
					isHealing = false;
					return true;
				} else {
					lg("⚠️ KHÔNG THẤY BẮT ĐẦU", "warn");
					healBtn.className = "bot-btn on";
					healBtn.innerText = "💊 HỒI TOÀN ĐỘI";
					isHealing = false;
					return false;
				}
			} else {
				lg("⚠️ KHÔNG THẤY HỒI TOÀN ĐỘI", "warn");
				isHealing = false;
				return false;
			}
		}

		healBtn.onclick = function (e) {
			e.stopPropagation();
			healMode = !healMode;
			if (healMode) {
				healBtn.className = "bot-btn on";
				healBtn.innerText = "💊 HỒI TOÀN ĐỘI";
				lg("🔴 HỒI TOÀN ĐỘI: BẬT", "click");
			} else {
				healBtn.className = "bot-btn off";
				healBtn.innerText = "💊 HỒI TOÀN ĐỘI";
				lg("⚪ HỒI TOÀN ĐỘI: TẮT", "warn");
			}
		};

		function updateStatus(state) {
			dot.className = "bot-dot";
			if (state === "RUN") {
				dot.classList.add("green");
				tog.innerText = "STOP";
				tog.style.background = colorGrad;
			} else if (state === "STOP") {
				dot.classList.add("yellow");
				tog.innerText = "RUN";
				tog.style.background = "linear-gradient(135deg,#4caf50,#2e7d32)";
			} else if (state === "PAUSE") {
				dot.classList.add("red");
				tog.innerText = "RUN";
				tog.style.background = "linear-gradient(135deg,#ff6b35,#f7931e)";
			}
		}

		tog.onclick = function () {
			if (run) {
				run = false;
				updateStatus("STOP");
				lg("⏸️ DỪNG", "warn");
			} else {
				if (maxRuns > 0 && runCount >= maxRuns) {
					runCount = 0;
					lg("🔄 RESET ĐẾM SỐ LẦN ĐI (0/" + maxRuns + ")", "click");
				}
				run = true;
				updateStatus("RUN");
				lg("▶️ CHẠY", "success");
			}
		};

		del.oninput = function () {
			var v = parseInt(del.value) || 2000;
			delay = Math.max(200, v);
		};

		lim.oninput = function () {
			var v = parseInt(lim.value) || 0;
			maxRuns = Math.max(0, v);
			if (maxRuns > 0) {
				lg("🎯 GIỚI HẠN: " + maxRuns + " LẦN (Đã đi: " + runCount + "/" + maxRuns + ")", "click");
			} else {
				lg("🎯 GIỚI HẠN: VÔ HẠN (0)", "warn");
			}
		};

		function checkError(scope) {
			if (!scope) return false;
			var staErr = checkTeamStamina(scope);
			if (staErr && staErr.hasError) {
				if (run) {
					run = false;
					updateStatus("PAUSE");
					lg("⚠️ " + staErr.reason, "error");
					return true;
				}
			}
			return false;
		}

		var lastActionTime = 0;

		function getStandardBCScope() {
			var embeds = Array.from(
				document.querySelectorAll(
					'article[class*="__623de"], [class*="embedFull"], [class*="embedWrapper"]',
				),
			);
			if (embeds.length > 0) {
				var targetEmbed = embeds[embeds.length - 1];
				var container =
					targetEmbed.closest('li[id^="chat-messages-"]') ||
					targetEmbed.closest('[class*="messageListItem"]') ||
					targetEmbed.closest('[id^="message-accessories-"]') ||
					targetEmbed.closest('[class*="container_b7e1cb"]') ||
					targetEmbed.closest('[class*="container_"]') ||
					targetEmbed.parentElement;
				if (container) return container;
			}

			var msgs = Array.from(
				document.querySelectorAll(
					'li[id^="chat-messages-"], [class*="messageListItem"]',
				),
			);
			for (var i = msgs.length - 1; i >= Math.max(0, msgs.length - 2); i--) {
				var m = msgs[i];
				if (m.querySelector('[class*="actionRow"], [id^="message-accessories-"], [class*="container_"]')) {
					return m;
				}
			}

			return null;
		}

		async function loop() {
			if (!run || wait || isHealing) return;
			skipMessage();

			var scope = getStandardBCScope();
			if (checkError(scope)) return;
			if (!scope) return;

			var rawBtns = Array.from(
				scope.querySelectorAll('[class*="actionRow"] button, [id^="message-accessories-"] button, [class*="container_"] button, button[class*="component"], [role="button"][class*="component"]')
			);

			if (!rawBtns.length) {
				rawBtns = Array.from(scope.querySelectorAll('button, [role="button"]'));
			}

			var btns = rawBtns.filter(function (b) {
				if (b.disabled || b.getAttribute("aria-disabled") === "true") return false;

				var aria = (b.getAttribute("aria-label") || "").toLowerCase();
				if (
					aria.includes("reaction") ||
					aria.includes("phản ứng") ||
					aria.includes("reply") ||
					aria.includes("trả lời") ||
					aria.includes("more") ||
					aria.includes("khác") ||
					aria.includes("pin") ||
					aria.includes("ghim") ||
					aria.includes("emoji") ||
					aria.includes("gif") ||
					aria.includes("sticker") ||
					aria.includes("gift") ||
					aria.includes("app")
				) {
					return false;
				}

				if (b.hasAttribute("data-mana-component")) return false;

				var t = (b.innerText || b.textContent || "").trim().toLowerCase();
				if (!t) return false;
				if (
					t.includes("bỏ qua tin") ||
					t.includes("dismiss") ||
					t.includes("rời đội") ||
					t.includes("cuộc trò chuyện") ||
					t.includes("tìm hoặc") ||
					t.includes("trò chuyện")
				) {
					return false;
				}
				return true;
			});

			function trackActionAndCheckLag(actionName) {
				if (lastActionName === actionName) {
					actionClickCount++;
				} else {
					lastActionName = actionName;
					actionClickCount = 1;
				}

				if (actionClickCount >= 4) {
					var homeBtn = findHomeBiCanhButton();
					if (homeBtn) {
						wait = true;
						lg("🚨 KẸT ẢI (" + lastActionName + " x" + actionClickCount + ") -> BẤM 'BÍ CẢNH' Ở TRANG CHỦ!", "warn");
						homeBtn.click();
						actionClickCount = 0;
						lastActionName = "";
						startClickCount = 0;
						return true;
					} else {
						run = false;
						updateStatus("PAUSE");
						lg("⚠️ KẸT ẢI (" + lastActionName + " x" + actionClickCount + ") NHƯNG KHÔNG TÌM THẤY ENTRY 'BÍ CẢNH' TRANG CHỦ (TRONG 8 TIN GẦN NHẤT) -> TẠM DỪNG!", "error");
						actionClickCount = 0;
						lastActionName = "";
						return true;
					}
				}
				return false;
			}

			if (!btns.length) {
				noButtonTickCount++;
				if (noButtonTickCount >= 4) {
					var homeBtn = findHomeBiCanhButton();
					if (homeBtn) {
						wait = true;
						lg("🚨 GIAO DIỆN TREO KHÔNG NÚT (>4s) -> BẤM 'BÍ CẢNH' Ở TRANG CHỦ!", "warn");
						homeBtn.click();
						noButtonTickCount = 0;
						actionClickCount = 0;
						lastActionName = "";
						startClickCount = 0;
						await sleep(3000 + jitter);
						wait = false;
						return;
					} else {
						run = false;
						updateStatus("PAUSE");
						lg("⚠️ GIAO DIỆN TREO KHÔNG NÚT (>4s) & KHÔNG TÌM THẤY ENTRY 'BÍ CẢNH' TRANG CHỦ (TRONG 8 TIN GẦN NHẤT) -> TẠM DỪNG!", "error");
						noButtonTickCount = 0;
						return;
					}
				}
				return;
			}
			noButtonTickCount = 0;

			var jitter = Math.floor(Math.random() * 200);

			var btnKetQua = btns.find(function (b) {
				var t = (b.innerText || b.textContent || "").trim().toLowerCase();
				return (
					t.includes("kết quả nhanh") ||
					t.includes("xem kết quả") ||
					t.includes("kết quả")
				);
			});
			if (btnKetQua) {
				if (trackActionAndCheckLag("KẾT QUẢ NHANH")) {
					await sleep(3000 + jitter);
					wait = false;
					return;
				}
				wait = true;
				lg("📊 NHẤN: " + (btnKetQua.innerText || btnKetQua.textContent || "").trim() + (actionClickCount > 1 ? " (Lần " + actionClickCount + ")" : ""), "click");
				btnKetQua.click();
				await sleep(1500);
				wait = false;
				return;
			}

			var btnChienTiep = btns.find(function (b) {
				var t = (b.innerText || b.textContent || "").trim().toLowerCase();
				return t.includes("chiến tiếp");
			});
			if (btnChienTiep) {
				startClickCount = 0;
				actionClickCount = 0;
				lastActionName = "";
				runCount++;
				lg("🏁 HOÀN THÀNH LƯỢT " + runCount + (maxRuns > 0 ? "/" + maxRuns : ""), "success");
				if (maxRuns > 0 && runCount >= maxRuns) {
					wait = true;
					lg("✅ NHẤN: " + (btnChienTiep.innerText || btnChienTiep.textContent || "").trim(), "click");
					btnChienTiep.click();
					run = false;
					updateStatus("STOP");
					lg("🛑 ĐÃ HOÀN THÀNH ĐỦ " + maxRuns + " LẦN ĐI -> TỰ ĐỘNG DỪNG AUTO!", "warn");
					wait = false;
					return;
				}
				wait = true;
				lg("✅ NHẤN: " + (btnChienTiep.innerText || btnChienTiep.textContent || "").trim(), "click");
				btnChienTiep.click();
				lg("⏳ DỪNG 3S TRƯỚC KHI HỒI...", "warn");
				await sleep(3000);
				if (healMode) {
					lg("💊 THỰC HIỆN HỒI TOÀN ĐỘI...", "click");
					await autoHealTeamStandard();
				} else {
					lg("⚪ HỒI TOÀN ĐỘI ĐANG TẮT, BỎ QUA", "warn");
				}
				wait = false;
				return;
			}

			var btnTiepTuc = btns.find(function (b) {
				var t = (b.innerText || b.textContent || "").trim().toLowerCase();
				return t.includes("tiếp tục");
			});
			if (btnTiepTuc) {
				if (trackActionAndCheckLag("TIẾP TỤC")) {
					await sleep(3000 + jitter);
					wait = false;
					return;
				}
				startClickCount = 0;
				wait = true;
				lg("⏩ TIẾP TỤC ẢI: " + (btnTiepTuc.innerText || btnTiepTuc.textContent || "").trim() + (actionClickCount > 1 ? " (Lần " + actionClickCount + ")" : ""), "click");
				btnTiepTuc.click();
				await sleep(delay + jitter);
				wait = false;
				return;
			}

			var combatKeywords = [
				"khai chiến",
				"khiêu chiến",
				"chiến đấu",
				"vào trận",
				"tiến vào",
				"tấn công",
				"bắt đầu đánh",
				"khai trận",
			];
			var btnKhaiChien = btns.find(function (b) {
				var t = (b.innerText || b.textContent || "").trim().toLowerCase();
				return combatKeywords.some(function (k) {
					return t.includes(k);
				});
			});
			if (btnKhaiChien) {
				if (trackActionAndCheckLag("KHAI CHIẾN")) {
					await sleep(3000 + jitter);
					wait = false;
					return;
				}
				var now = Date.now();
				if (now - lastActionTime < 3500) {
					return;
				}
				wait = true;
				lastActionTime = now;
				lg("⚔️ NHẤN: " + (btnKhaiChien.innerText || btnKhaiChien.textContent || "").trim() + (actionClickCount > 1 ? " (Lần " + actionClickCount + ")" : ""), "click");
				btnKhaiChien.click();
				await sleep(2500 + jitter);
				wait = false;
				return;
			}

			var extraEvents = [
				"rời đi giữ mình",
				"tránh xa hố đen",
				"dùng linh lực cân bằng",
				"tiến đến chào hỏi",
				"phong ấn bảo tồn",
				"hứng lấy linh nhũ",
				"lắng nghe tiếng sấm",
				"để lại cho sinh linh khác",
			];
			var sideEventBtn = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return extraEvents.some(function (ev) {
					return t.includes(ev);
				});
			});
			if (sideEventBtn) {
				if (trackActionAndCheckLag("SỰ KIỆN: " + sideEventBtn.innerText.trim())) {
					await sleep(3000 + jitter);
					wait = false;
					return;
				}
				wait = true;
				lg("🔮 SỰ KIỆN: " + sideEventBtn.innerText.trim() + (actionClickCount > 1 ? " (Lần " + actionClickCount + ")" : ""), "click");
				sideEventBtn.click();
				await sleep(delay + jitter);
				wait = false;
				return;
			}

			var targetGate = null;
			var pList = ["sinh", "hưu", "cảnh", "khai", "thương", "kinh"];
			for (var i = 0; i < pList.length; i++) {
				var p = pList[i];
				targetGate = btns.find(function (b) {
					return (
						b.innerText.toLowerCase().includes(p) && b.innerText.includes("[")
					);
				});
				if (targetGate) break;
			}
			if (targetGate) {
				if (trackActionAndCheckLag("CỔNG BÁT MÔN: " + targetGate.innerText.trim())) {
					await sleep(3000 + jitter);
					wait = false;
					return;
				}
				wait = true;
				lg("🚪 NHẤN CỔNG: " + targetGate.innerText.trim() + (actionClickCount > 1 ? " (Lần " + actionClickCount + ")" : ""), "click");
				targetGate.click();
				await sleep(delay + jitter);
				wait = false;
				return;
			}

			var btnStart = btns.find(function (b) {
				var t = (b.innerText || b.textContent || "").trim().toLowerCase();
				return (
					(t === "bắt đầu" || t.startsWith("bắt đầu") || t.includes("bắt đầu") || t.includes("khởi hành") || t.includes("khám phá")) &&
					!t.includes("cuộc trò chuyện") &&
					!t.includes("tìm hoặc") &&
					!t.includes("trò chuyện")
				);
			});
			if (btnStart) {
				if (maxRuns > 0 && runCount >= maxRuns) {
					run = false;
					updateStatus("STOP");
					lg("🛑 ĐÃ ĐẠT GIỚI HẠN " + maxRuns + " LẦN ĐI -> DỪNG AUTO!", "warn");
					return;
				}

				startClickCount++;
				if (startClickCount >= 4) {
					var homeBtn = findHomeBiCanhButton();
					if (homeBtn) {
						wait = true;
						lg("🚨 SẢNH KẸT BẮT ĐẦU " + startClickCount + " LẦN -> BẤM 'BÍ CẢNH' Ở TRANG CHỦ!", "warn");
						homeBtn.click();
						startClickCount = 0;
						actionClickCount = 0;
						lastActionName = "";
						await sleep(3000 + jitter);
						wait = false;
						return;
					} else {
						run = false;
						updateStatus("PAUSE");
						lg("⚠️ SẢNH KẸT BẮT ĐẦU " + startClickCount + " LẦN & KHÔNG TÌM THẤY ENTRY 'BÍ CẢNH' TRANG CHỦ (TRONG 8 TIN GẦN NHẤT) -> TẠM DỪNG!", "error");
						startClickCount = 0;
						return;
					}
				}

				if (startClickCount >= 3) {
					var btnRefreshNow = btns.find(function (b) {
						var t = (b.innerText || b.textContent || "").trim().toLowerCase();
						return (
							t.includes("làm mới") ||
							t.includes("làmmới") ||
							t.includes("cập nhật") ||
							t.includes("refresh")
						);
					});
					if (btnRefreshNow) {
						wait = true;
						lg("🔄 ĐÃ BẤM BẮT ĐẦU " + startClickCount + " LẦN CHƯA PHẢN HỒI -> BẤM LÀM MỚI SẢNH!", "warn");
						btnRefreshNow.click();
						startClickCount = 0;
						await sleep(delay + jitter);
						wait = false;
						return;
					}
				}

				wait = true;
				lg("✅ BẮT ĐẦU" + (startClickCount > 1 ? " (Lần " + startClickCount + ")" : ""), "click");
				btnStart.click();
				await sleep(delay + jitter);
				wait = false;
				return;
			}

			var btnRefresh = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return (
					t.includes("làm mới") ||
					t.includes("làmmới") ||
					t.includes("cập nhật") ||
					t.includes("refresh")
				);
			});
			if (btnRefresh) {
				wait = true;
				lg(
					"🔄 NHẤN: " +
						btnRefresh.innerText.trim() +
						" (Tự động hiện lại nút Bắt đầu)",
					"click",
				);
				btnRefresh.click();
				await sleep(delay + jitter);
				wait = false;
				return;
			}
		}

		window[intervalKey] = setInterval(loop, 1000);
		updateStatus("RUN");
		lg("🚀 KHỞI ĐỘNG " + title, "success");
		lg("⚪ HỒI TOÀN ĐỘI: TẮT", "warn");
	}

	function runBC() {
		runStandardBC({
			id: "b2",
			title: "⚔️ BÍ CẢNH",
			colorGrad: "linear-gradient(135deg,#ff3b30,#ff2d55)",
			intervalKey: "_bc",
			onExit: function () {
				mainMenu();
			},
		});
	}

	function runUMinh() {
		if (window._uminh) clearInterval(window._uminh);
		var c = makeBot(
			"bu",
			'<div class="bot-header" id="buh"><div class="bot-title"><span class="bot-dot" id="statusDotU"></span>🌑 U MINH CỔ MỘ</div><div class="header-right"><div class="bc-delay-block">⏱️Delay<input type="number" id="udel" value="2000" min="200" step="100" class="bc-input-ms"><span>ms</span></div><div class="bc-delay-block" title="Giới hạn số lần đi (0 = Vô hạn)">🎯Lần<input type="number" id="ulim" value="0" min="0" step="1" class="bc-input-ms" style="width:24px;"></div><button id="bmu" class="bot-btn" style="background:0 0;border:1px solid rgba(0,240,255,0.08);color:#00f0ff;font-size:14px;cursor:pointer;padding:0 6px;height:24px;">−</button></div></div><div class="bot-main-body" id="bumu"><div class="btn-row"><button class="bot-btn off" id="bhealU">💊 HỒI TOÀN ĐỘI</button><button class="bot-btn off" id="bumSafe">🛡️ AN TOÀN</button><button class="bot-btn on" id="bumBal">⚖️ CÂN BẰNG</button><button class="bot-btn off" id="bumRisk">☠️ RỦI RO</button><button class="bot-btn" id="btu">STOP</button><button class="bot-btn" id="bxu">THOÁT</button></div><div class="bot-footer"><div class="bot-log" id="blu"></div></div></div>',
			"#buh",
			function () {
				menuLuyenHu();
			},
		);

		var log = $("#blu");
		var main = $("#bumu");
		var min = $("#bmu");
		var tog = $("#btu");
		var del = $("#udel");
		var lim = $("#ulim");
		var healBtn = $("#bhealU");
		var btnSafe = $("#bumSafe");
		var btnBal = $("#bumBal");
		var btnRisk = $("#bumRisk");
		var dot = $("#statusDotU");
		var run = true;
		var delay = 2000;
		var maxRuns = 0;
		var runCount = 0;
		var mini = false;
		var wait = false;
		var healMode = false;
		var isHealing = false;
		var mode = "BALANCE";
		var startClickCount = 0;
		var lastActionName = "";
		var actionClickCount = 0;
		var noButtonTickCount = 0;

		dot.className = "bot-dot green";
		min.onclick = function (e) {
			e.stopPropagation();
			mini = !mini;
			main.classList.toggle("c", mini);
			min.textContent = mini ? "+" : "−";
		};

		function lg(t, type) {
			type = type || "";
			var time = new Date().toLocaleTimeString();
			log.innerHTML +=
				'<span class="log-time">[' +
				time +
				']</span> <span class="log-' +
				type +
				'">' +
				t +
				"</span>";
			if (log.childNodes.length > 15) log.removeChild(log.firstChild);
			log.scrollTop = log.scrollHeight;
		}

		btnSafe.onclick = function (e) {
			e.stopPropagation();
			mode = "SAFE";
			btnSafe.className = "bot-btn on";
			btnBal.className = "bot-btn off";
			btnRisk.className = "bot-btn off";
			lg("🛡️ CHẾ ĐỘ: AN TOÀN (Ưu tiên nút * lành tính)", "success");
		};

		btnBal.onclick = function (e) {
			e.stopPropagation();
			mode = "BALANCE";
			btnBal.className = "bot-btn on";
			btnSafe.className = "bot-btn off";
			btnRisk.className = "bot-btn off";
			lg("⚖️ CHẾ ĐỘ: CÂN BẰNG (Happy path qua ải)", "click");
		};

		btnRisk.onclick = function (e) {
			e.stopPropagation();
			mode = "RISK";
			btnRisk.className = "bot-btn on";
			btnSafe.className = "bot-btn off";
			btnBal.className = "bot-btn off";
			lg("☠️ CHẾ ĐỘ: RỦI RO (Tích oán khí triệu hồi Boss Ẩn)", "warn");
		};

		async function autoHealTeamU() {
			if (!healMode || isHealing) return false;
			isHealing = true;
			lg("💊 ĐANG HỒI TOÀN ĐỘI...", "click");
			healBtn.className = "bot-btn on";
			healBtn.innerText = "💊 ĐANG HỒI...";

			var scope = getUMinhScope();
			var searchRoot = scope || document;

			var hf = Array.from(
				searchRoot.querySelectorAll('button, a, [role="button"]'),
			).find(function (x) {
				var t = (x.innerText || x.textContent || "").trim().toLowerCase();
				return (
					t.includes("hồi toàn đội") ||
					t.includes("hồi máu") ||
					t.includes("hồi đội")
				);
			});

			if (hf) {
				hf.click();
				lg("✅ HỒI TOÀN ĐỘI LẦN 1", "success");
				await sleep(500);
				hf.click();
				lg("✅ HỒI TOÀN ĐỘI LẦN 2", "success");
				await sleep(600);

				var st = null;
				for (var attempt = 0; attempt < 3; attempt++) {
					var currentScope = getUMinhScope() || document;
					st = Array.from(
						currentScope.querySelectorAll('button, a, [role="button"]'),
					).find(function (x) {
						var t = (x.innerText || x.textContent || "").trim().toLowerCase();
						return (
							t.includes("bắt đầu") ||
							t.includes("bắtđầu") ||
							t.includes("khởi hành") ||
							t.includes("khám phá")
						);
					});
					if (st) break;
					await sleep(400);
				}

				if (st) {
					st.click();
					lg("✅ BẮT ĐẦU", "success");
					healBtn.className = "bot-btn on";
					healBtn.innerText = "💊 HỒI TOÀN ĐỘI";
					isHealing = false;
					return true;
				} else {
					lg("⚠️ KHÔNG THẤY BẮT ĐẦU", "warn");
					healBtn.className = "bot-btn on";
					healBtn.innerText = "💊 HỒI TOÀN ĐỘI";
					isHealing = false;
					return false;
				}
			} else {
				lg("⚠️ KHÔNG THẤY HỒI TOÀN ĐỘI", "warn");
				isHealing = false;
				return false;
			}
		}

		healBtn.onclick = function (e) {
			e.stopPropagation();
			healMode = !healMode;
			if (healMode) {
				healBtn.className = "bot-btn on";
				healBtn.innerText = "💊 HỒI TOÀN ĐỘI";
				lg("🔴 HỒI TOÀN ĐỘI: BẬT", "click");
			} else {
				healBtn.className = "bot-btn off";
				healBtn.innerText = "💊 HỒI TOÀN ĐỘI";
				lg("⚪ HỒI TOÀN ĐỘI: TẮT", "warn");
			}
		};

		function updateStatus(state) {
			dot.className = "bot-dot";
			if (state === "RUN") {
				dot.classList.add("green");
				tog.innerText = "STOP";
				tog.style.background = "linear-gradient(135deg,#9b59b6,#8e44ad)";
			} else if (state === "STOP") {
				dot.classList.add("yellow");
				tog.innerText = "RUN";
				tog.style.background = "linear-gradient(135deg,#4caf50,#2e7d32)";
			} else if (state === "PAUSE") {
				dot.classList.add("red");
				tog.innerText = "RUN";
				tog.style.background = "linear-gradient(135deg,#ff6b35,#f7931e)";
			}
		}

		tog.onclick = function () {
			if (run) {
				run = false;
				updateStatus("STOP");
				lg("⏸️ DỪNG", "warn");
			} else {
				if (maxRuns > 0 && runCount >= maxRuns) {
					runCount = 0;
					lg("🔄 RESET ĐẾM SỐ LẦN ĐI (0/" + maxRuns + ")", "click");
				}
				run = true;
				updateStatus("RUN");
				lg("▶️ CHẠY", "success");
			}
		};

		del.oninput = function () {
			var v = parseInt(del.value) || 2000;
			delay = Math.max(200, v);
		};

		lim.oninput = function () {
			var v = parseInt(lim.value) || 0;
			maxRuns = Math.max(0, v);
			if (maxRuns > 0) {
				lg("🎯 GIỚI HẠN: " + maxRuns + " LẦN (Đã đi: " + runCount + "/" + maxRuns + ")", "click");
			} else {
				lg("🎯 GIỚI HẠN: VÔ HẠN (0)", "warn");
			}
		};

		var exitBtn = $("#bxu");
		if (exitBtn) {
			exitBtn.onclick = function (e) {
				e.stopPropagation();
				if (window._uminh) clearInterval(window._uminh);
				c.remove();
				menuLuyenHu();
			};
		}

		function checkError(scope) {
			if (!scope) return false;
			var staErr = checkTeamStamina(scope);
			if (staErr && staErr.hasError) {
				if (run) {
					run = false;
					updateStatus("PAUSE");
					lg("⚠️ " + staErr.reason, "error");
					return true;
				}
			}
			return false;
		}

		var lastActionTime = 0;

		function getUMinhScope() {
			var embeds = Array.from(
				document.querySelectorAll(
					'article[class*="__623de"], [class*="embedFull"], [class*="embedWrapper"]',
				),
			);
			if (embeds.length > 0) {
				var targetEmbed = embeds[embeds.length - 1];
				var container =
					targetEmbed.closest('li[id^="chat-messages-"]') ||
					targetEmbed.closest('[class*="messageListItem"]') ||
					targetEmbed.closest('[id^="message-accessories-"]') ||
					targetEmbed.closest('[class*="container_b7e1cb"]') ||
					targetEmbed.closest('[class*="container_"]') ||
					targetEmbed.parentElement;
				if (container) return container;
			}

			var msgs = Array.from(
				document.querySelectorAll(
					'li[id^="chat-messages-"], [class*="messageListItem"]',
				),
			);
			for (var i = msgs.length - 1; i >= Math.max(0, msgs.length - 2); i--) {
				var m = msgs[i];
				if (m.querySelector('[class*="actionRow"], [id^="message-accessories-"], [class*="container_"]')) {
					return m;
				}
			}

			return null;
		}

		var uMinhEvents = [
			{
				name: "Võ Hồn Bia Đá",
				safeBal: ["thành tâm bái tạ", "bái tạ"],
				risk: ["lĩnh hội võ hồn", "lĩnh hội"],
			},
			{
				name: "Tâm Trận U Minh",
				safeBal: [
					"dùng minh chủng áp chế trận pháp",
					"dùng minh chủng",
				],
				risk: [
					"cương ngạnh dùng linh lực phá trận",
					"cương ngạnh",
					"linh lực phá trận",
				],
			},
			{
				name: "Hấp Thu Tử Khí",
				safeBal: ["tránh xa tử khí", "tránh xa"],
				risk: ["hấp thu tử khí nhập thể", "hấp thu tử khí"],
			},
			{
				name: "Quan Tài Bí Ẩn",
				safe: ["bỏ qua để an toàn", "bỏ qua"],
				balRisk: [
					"phá giải niêm phong mở quan tài",
					"phá giải niêm phong",
					"mở quan tài",
				],
			},
			{
				name: "Tà Đàn Hóa Ma",
				safe: ["phá hủy tà đàn", "phá hủy"],
				balRisk: ["hấp thu ma tinh", "ma tinh"],
			},
			{
				name: "Huyết Mạch Tế Lễ",
				safeBal: ["thành tâm tĩnh bái", "tĩnh bái"],
				risk: ["trích huyết tế thần", "trích huyết"],
			},
		];

		async function loop() {
			if (!run || wait || isHealing) return;
			skipMessage();

			var scope = getUMinhScope();
			if (checkError(scope)) return;
			if (!scope) return;

			var rawBtns = Array.from(
				scope.querySelectorAll('[class*="actionRow"] button, [id^="message-accessories-"] button, [class*="container_"] button, button[class*="component"], [role="button"][class*="component"]')
			);

			if (!rawBtns.length) {
				rawBtns = Array.from(scope.querySelectorAll('button, [role="button"]'));
			}

			var btns = rawBtns.filter(function (b) {
				if (b.disabled || b.getAttribute("aria-disabled") === "true") return false;

				var aria = (b.getAttribute("aria-label") || "").toLowerCase();
				if (
					aria.includes("reaction") ||
					aria.includes("phản ứng") ||
					aria.includes("reply") ||
					aria.includes("trả lời") ||
					aria.includes("more") ||
					aria.includes("khác") ||
					aria.includes("pin") ||
					aria.includes("ghim") ||
					aria.includes("emoji") ||
					aria.includes("gif") ||
					aria.includes("sticker") ||
					aria.includes("gift") ||
					aria.includes("app")
				) {
					return false;
				}

				if (b.hasAttribute("data-mana-component")) return false;

				var t = (b.innerText || b.textContent || "").trim().toLowerCase();
				if (!t) return false;
				if (
					t.includes("bỏ qua tin") ||
					t.includes("dismiss") ||
					t.includes("rời đội") ||
					t.includes("cuộc trò chuyện") ||
					t.includes("tìm hoặc") ||
					t.includes("trò chuyện")
				) {
					return false;
				}
				return true;
			});

			function trackActionAndCheckLag(actionName) {
				if (lastActionName === actionName) {
					actionClickCount++;
				} else {
					lastActionName = actionName;
					actionClickCount = 1;
				}

				if (actionClickCount >= 4) {
					var homeBtn = findHomeBiCanhButton();
					if (homeBtn) {
						wait = true;
						lg("🚨 KẸT ẢI (" + lastActionName + " x" + actionClickCount + ") -> BẤM 'BÍ CẢNH' Ở TRANG CHỦ!", "warn");
						homeBtn.click();
						actionClickCount = 0;
						lastActionName = "";
						startClickCount = 0;
						return true;
					} else {
						run = false;
						updateStatus("PAUSE");
						lg("⚠️ KẸT ẢI (" + lastActionName + " x" + actionClickCount + ") NHƯNG KHÔNG TÌM THẤY ENTRY 'BÍ CẢNH' TRANG CHỦ (TRONG 8 TIN GẦN NHẤT) -> TẠM DỪNG!", "error");
						actionClickCount = 0;
						lastActionName = "";
						return true;
					}
				}
				return false;
			}

			if (!btns.length) {
				noButtonTickCount++;
				if (noButtonTickCount >= 4) {
					var homeBtn = findHomeBiCanhButton();
					if (homeBtn) {
						wait = true;
						lg("🚨 GIAO DIỆN TREO KHÔNG NÚT (>4s) -> BẤM 'BÍ CẢNH' Ở TRANG CHỦ!", "warn");
						homeBtn.click();
						noButtonTickCount = 0;
						actionClickCount = 0;
						lastActionName = "";
						startClickCount = 0;
						await sleep(3000 + jitter);
						wait = false;
						return;
					} else {
						run = false;
						updateStatus("PAUSE");
						lg("⚠️ GIAO DIỆN TREO KHÔNG NÚT (>4s) & KHÔNG TÌM THẤY ENTRY 'BÍ CẢNH' TRANG CHỦ (TRONG 8 TIN GẦN NHẤT) -> TẠM DỪNG!", "error");
						noButtonTickCount = 0;
						return;
					}
				}
				return;
			}
			noButtonTickCount = 0;

			var jitter = Math.floor(Math.random() * 200);

			var btnKetQua = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return t.includes("kết quả nhanh") || t.includes("xem kết quả");
			});
			if (btnKetQua) {
				if (trackActionAndCheckLag("KẾT QUẢ NHANH")) {
					await sleep(3000 + jitter);
					wait = false;
					return;
				}
				wait = true;
				lg("📊 NHẤN: " + btnKetQua.innerText.trim() + (actionClickCount > 1 ? " (Lần " + actionClickCount + ")" : ""), "click");
				btnKetQua.click();
				await sleep(1500);
				wait = false;
				return;
			}

			var btnChienTiep = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return t.includes("chiến tiếp");
			});
			if (btnChienTiep) {
				startClickCount = 0;
				actionClickCount = 0;
				lastActionName = "";
				runCount++;
				lg("🏁 HOÀN THÀNH LƯỢT " + runCount + (maxRuns > 0 ? "/" + maxRuns : ""), "success");
				if (maxRuns > 0 && runCount >= maxRuns) {
					wait = true;
					lg("✅ NHẤN: " + btnChienTiep.innerText.trim(), "click");
					btnChienTiep.click();
					run = false;
					updateStatus("STOP");
					lg("🛑 ĐÃ HOÀN THÀNH ĐỦ " + maxRuns + " LẦN ĐI -> TỰ ĐỘNG DỪNG AUTO!", "warn");
					wait = false;
					return;
				}
				wait = true;
				lg("✅ NHẤN: " + btnChienTiep.innerText.trim(), "click");
				btnChienTiep.click();
				lg("⏳ DỪNG 3S TRƯỚC KHI HỒI...", "warn");
				await sleep(3000);
				if (healMode) {
					lg("💊 THỰC HIỆN HỒI TOÀN ĐỘI...", "click");
					await autoHealTeamU();
				} else {
					lg("⚪ HỒI TOÀN ĐỘI ĐANG TẮT, BỎ QUA", "warn");
				}
				wait = false;
				return;
			}

			var btnTiepTuc = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return t.includes("tiếp tục");
			});
			if (btnTiepTuc) {
				if (trackActionAndCheckLag("TIẾP TỤC")) {
					await sleep(3000 + jitter);
					wait = false;
					return;
				}
				startClickCount = 0;
				wait = true;
				lg("⏩ TIẾP TỤC ẢI: " + btnTiepTuc.innerText.trim() + (actionClickCount > 1 ? " (Lần " + actionClickCount + ")" : ""), "click");
				btnTiepTuc.click();
				await sleep(delay + jitter);
				wait = false;
				return;
			}

			var combatKeywords = [
				"khai chiến",
				"khiêu chiến",
				"chiến đấu",
				"vào trận",
				"tiến vào",
				"tấn công",
				"bắt đầu đánh",
				"khai trận",
			];
			var btnKhaiChien = btns.find(function (b) {
				var t = (b.innerText || b.textContent || "").trim().toLowerCase();
				return combatKeywords.some(function (k) {
					return t.includes(k);
				});
			});
			if (btnKhaiChien) {
				if (trackActionAndCheckLag("KHAI CHIẾN")) {
					await sleep(3000 + jitter);
					wait = false;
					return;
				}
				var now = Date.now();
				if (now - lastActionTime < 3500) {
					return;
				}
				wait = true;
				lastActionTime = now;
				lg("⚔️ NHẤN: " + (btnKhaiChien.innerText || btnKhaiChien.textContent || "").trim() + (actionClickCount > 1 ? " (Lần " + actionClickCount + ")" : ""), "click");
				btnKhaiChien.click();
				await sleep(2500 + jitter);
				wait = false;
				return;
			}

			for (var i = 0; i < uMinhEvents.length; i++) {
				var ev = uMinhEvents[i];
				var chosenBtn = null;

				if (ev.name === "Quan Tài Bí Ẩn" || ev.name === "Tà Đàn Hóa Ma") {
					if (mode === "SAFE") {
						chosenBtn = btns.find(function (b) {
							var t = b.innerText.trim().toLowerCase();
							return ev.safe.some(function (k) {
								return t.includes(k);
							});
						});
					} else {
						chosenBtn = btns.find(function (b) {
							var t = b.innerText.trim().toLowerCase();
							return ev.balRisk.some(function (k) {
								return t.includes(k);
							});
						});
					}
				} else {
					if (mode === "SAFE" || mode === "BALANCE") {
						chosenBtn = btns.find(function (b) {
							var t = b.innerText.trim().toLowerCase();
							return ev.safeBal.some(function (k) {
								return t.includes(k);
							});
						});
					} else {
						chosenBtn = btns.find(function (b) {
							var t = b.innerText.trim().toLowerCase();
							return ev.risk.some(function (k) {
								return t.includes(k);
							});
						});
					}
				}

				if (chosenBtn) {
					if (trackActionAndCheckLag("KỲ NGỘ: " + chosenBtn.innerText.trim())) {
						await sleep(3000 + jitter);
						wait = false;
						return;
					}
					wait = true;
					lg("🌑 NHẤN: " + chosenBtn.innerText.trim() + (actionClickCount > 1 ? " (Lần " + actionClickCount + ")" : ""), "click");
					chosenBtn.click();
					await sleep(delay + jitter);
					wait = false;
					return;
				}
			}

			var targetGate = null;
			var pList = ["sinh", "hưu", "cảnh", "khai", "thương", "kinh"];
			for (var i = 0; i < pList.length; i++) {
				var p = pList[i];
				targetGate = btns.find(function (b) {
					return (
						b.innerText.toLowerCase().includes(p) && b.innerText.includes("[")
					);
				});
				if (targetGate) break;
			}
			if (targetGate) {
				if (trackActionAndCheckLag("CỔNG BÁT MÔN: " + targetGate.innerText.trim())) {
					await sleep(3000 + jitter);
					wait = false;
					return;
				}
				wait = true;
				lg("🚪 NHẤN CỔNG: " + targetGate.innerText.trim() + (actionClickCount > 1 ? " (Lần " + actionClickCount + ")" : ""), "click");
				targetGate.click();
				await sleep(delay + jitter);
				wait = false;
				return;
			}

			var btnStart = btns.find(function (b) {
				var t = (b.innerText || b.textContent || "").trim().toLowerCase();
				return (
					(t === "bắt đầu" || t.startsWith("bắt đầu") || t.includes("bắt đầu") || t.includes("khởi hành") || t.includes("khám phá")) &&
					!t.includes("cuộc trò chuyện") &&
					!t.includes("tìm hoặc") &&
					!t.includes("trò chuyện")
				);
			});
			if (btnStart) {
				if (maxRuns > 0 && runCount >= maxRuns) {
					run = false;
					updateStatus("STOP");
					lg("🛑 ĐÃ ĐẠT GIỚI HẠN " + maxRuns + " LẦN ĐI -> DỪNG AUTO!", "warn");
					return;
				}

				startClickCount++;
				if (startClickCount >= 4) {
					var homeBtn = findHomeBiCanhButton();
					if (homeBtn) {
						wait = true;
						lg("🚨 SẢNH KẸT BẮT ĐẦU " + startClickCount + " LẦN -> BẤM 'BÍ CẢNH' Ở TRANG CHỦ!", "warn");
						homeBtn.click();
						startClickCount = 0;
						actionClickCount = 0;
						lastActionName = "";
						await sleep(3000 + jitter);
						wait = false;
						return;
					} else {
						run = false;
						updateStatus("PAUSE");
						lg("⚠️ SẢNH KẸT BẮT ĐẦU " + startClickCount + " LẦN & KHÔNG TÌM THẤY ENTRY 'BÍ CẢNH' TRANG CHỦ (TRONG 8 TIN GẦN NHẤT) -> TẠM DỪNG!", "error");
						startClickCount = 0;
						return;
					}
				}

				if (startClickCount >= 3) {
					var btnRefreshNow = btns.find(function (b) {
						var t = (b.innerText || b.textContent || "").trim().toLowerCase();
						return (
							t.includes("làm mới") ||
							t.includes("làmmới") ||
							t.includes("cập nhật") ||
							t.includes("refresh")
						);
					});
					if (btnRefreshNow) {
						wait = true;
						lg("🔄 ĐÃ BẤM BẮT ĐẦU " + startClickCount + " LẦN CHƯA PHẢN HỒI -> BẤM LÀM MỚI SẢNH!", "warn");
						btnRefreshNow.click();
						startClickCount = 0;
						await sleep(delay + jitter);
						wait = false;
						return;
					}
				}

				wait = true;
				lg("✅ BẮT ĐẦU" + (startClickCount > 1 ? " (Lần " + startClickCount + ")" : ""), "click");
				btnStart.click();
				await sleep(delay + jitter);
				wait = false;
				return;
			}

			var btnRefresh = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return (
					t.includes("làm mới") ||
					t.includes("làmmới") ||
					t.includes("cập nhật") ||
					t.includes("refresh")
				);
			});
			if (btnRefresh) {
				wait = true;
				lg(
					"🔄 NHẤN: " +
						btnRefresh.innerText.trim() +
						" (Tự động hiện lại nút Bắt đầu)",
					"click",
				);
				btnRefresh.click();
				await sleep(delay + jitter);
				wait = false;
				return;
			}
		}

		window._uminh = setInterval(loop, 1000);
		updateStatus("RUN");
		lg("🌑 KHỞI ĐỘNG U MINH CỔ MỘ", "success");
		lg("⚖️ CHẾ ĐỘ: CÂN BẰNG", "success");
		lg("⚪ HỒI TOÀN ĐỘI: TẮT", "warn");
	}

	function runLich10() {
		if (window._lich10) clearInterval(window._lich10);
		var c = makeBot(
			"l10",
			'<div class="bot-header" id="l10h"><div class="bot-title"><span class="bot-dot" id="statusDotL10"></span>⚡ LỊCH LUYỆN x10</div><div class="header-right"><div class="bc-delay-block">⏱️Delay<input type="number" id="l10del" value="1500" min="200" step="100" class="bc-input-ms"><span>ms</span></div><button id="bml10" class="bot-btn" style="background:0 0;border:1px solid rgba(0,240,255,0.08);color:#00f0ff;font-size:14px;cursor:pointer;padding:0 6px;height:24px;">−</button></div></div><div class="bot-main-body" id="l10m"><div class="btn-row"><button class="bot-btn off" id="bhealL10">💊 HỒI MÁU</button><button class="bot-btn" id="btl10">STOP</button><button class="bot-btn" id="bxl10">THOÁT</button></div><div class="bot-footer"><div class="bot-log" id="l10log"></div></div></div>',
			"#l10h",
			function () {
				mainMenu();
			},
		);

		var log = $("#l10log");
		var main = $("#l10m");
		var min = $("#bml10");
		var tog = $("#btl10");
		var del = $("#l10del");
		var healBtn = $("#bhealL10");
		var dot = $("#statusDotL10");
		var run = true;
		var delay = 1500;
		var mini = false;
		var wait = false;
		var healing = false;
		var isHealMode10 = false;

		dot.className = "bot-dot green";
		min.onclick = function (e) {
			e.stopPropagation();
			mini = !mini;
			main.classList.toggle("c", mini);
			min.textContent = mini ? "+" : "−";
		};

		function lg(t, type) {
			type = type || "";
			var time = new Date().toLocaleTimeString();
			log.innerHTML +=
				'<span class="log-time">[' +
				time +
				']</span> <span class="log-' +
				type +
				'">' +
				t +
				"</span>";
			if (log.childNodes.length > 15) log.removeChild(log.firstChild);
			log.scrollTop = log.scrollHeight;
		}

		healBtn.onclick = function (e) {
			e.stopPropagation();
			isHealMode10 = !isHealMode10;
			if (isHealMode10) {
				healBtn.className = "bot-btn on";
				healBtn.innerText = "💊 HỒI MÁU (<90% HP)";
				lg("🔴 HỒI MÁU TỰ ĐỘNG x10: BẬT (<90% HP)", "click");
			} else {
				healBtn.className = "bot-btn off";
				healBtn.innerText = "💊 HỒI MÁU";
				lg("⚪ HỒI MÁU TỰ ĐỘNG x10: TẮT", "warn");
			}
		};

		function updateStatus(state) {
			dot.className = "bot-dot";
			if (state === "RUN") {
				dot.classList.add("green");
				tog.innerText = "STOP";
				tog.style.background = "linear-gradient(135deg,#f7971e,#ffd200)";
			} else if (state === "STOP") {
				dot.classList.add("yellow");
				tog.innerText = "RUN";
				tog.style.background = "linear-gradient(135deg,#4caf50,#2e7d32)";
			}
		}

		tog.onclick = function () {
			if (run) {
				run = false;
				updateStatus("STOP");
				lg("⏸️ DỪNG", "warn");
			} else {
				run = true;
				updateStatus("RUN");
				lg("▶️ CHẠY", "success");
			}
		};

		del.oninput = function () {
			var v = parseInt(del.value) || 1500;
			delay = Math.max(200, v);
		};

		function getLichScope() {
			var embeds = Array.from(
				document.querySelectorAll(
					'article[class*="__623de"], [class*="embedFull"], [class*="markup_"]',
				),
			);
			if (!embeds.length) return document;

			var targetEmbed = null;
			for (var i = embeds.length - 1; i >= 0 && i >= embeds.length - 6; i--) {
				var emb = embeds[i];
				var txt = (emb.innerText || "").toLowerCase();
				if (
					txt.includes("lịch luyện") ||
					txt.includes("phase") ||
					txt.includes("kết quả") ||
					txt.includes("chiến lại") ||
					txt.includes("đồng minh") ||
					txt.includes("kẻ địch") ||
					txt.includes("sinh mệnh")
				) {
					targetEmbed = emb;
					break;
				}
			}

			if (!targetEmbed) targetEmbed = embeds[embeds.length - 1];

			var container =
				targetEmbed.closest('[id^="message-accessories-"]') ||
				targetEmbed.closest('[class*="container_b7e1cb"]') ||
				targetEmbed.closest('[class*="container_"]') ||
				targetEmbed.closest('li[id^="chat-messages-"]') ||
				targetEmbed.parentElement;
			return container || document;
		}

		function getCurrentStamina(scope) {
			var txt = scope.innerText || "";
			var m =
				txt.match(/Thể\s*lực[\s\S]*?(\d+)\s*\/\s*\d+/i) ||
				txt.match(/Hiện\s*có:\s*(\d+)\s*\/\s*\d+/i);
			if (m && m[1] !== undefined) {
				var val = parseInt(m[1], 10);
				if (!isNaN(val)) return val;
			}
			return null;
		}

		function parseCharacterHP(scope) {
			var txt = scope.innerText || "";
			var lines = txt.split("\n");
			for (var i = 0; i < lines.length; i++) {
				var line = lines[i].trim();
				if (
					line.includes("Sinh mệnh") ||
					line.includes("Sinh Mệnh") ||
					line.includes("Máu") ||
					line.includes("HP")
				) {
					var match = line.match(/(\d+)\s*\/\s*(\d+)/);
					if (match) {
						var curr = parseInt(match[1], 10);
						var max = parseInt(match[2], 10);
						if (!isNaN(curr) && !isNaN(max) && max > 0 && curr <= max) {
							return (curr / max) * 100;
						}
					}
				}
			}

			var generalMatch = txt.match(
				/(?:Sinh\s*mệnh|Máu|HP)[^\d]*?(\d+)\s*\/\s*(\d+)/i,
			);
			if (generalMatch) {
				var c = parseInt(generalMatch[1], 10);
				var m = parseInt(generalMatch[2], 10);
				if (!isNaN(c) && !isNaN(m) && m > 0 && c <= m) {
					return (c / m) * 100;
				}
			}

			return null;
		}

		function checkError() {
			var scope = getLichScope();

			var stamina = getCurrentStamina(scope);
			if (stamina !== null && stamina < 10) {
				if (run) {
					run = false;
					updateStatus("STOP");
					lg(
						"🛑 THỂ LỰC KHÔNG ĐỦ X10 (Hiện có " +
							stamina +
							"/10): DỪNG LỊCH LUYỆN x10!",
						"error",
					);
					return true;
				}
			}

			var btnX10 = Array.from(
				scope.querySelectorAll('button, a, [role="button"]'),
			).find(function (b) {
				var t = (b.innerText || "").trim().toLowerCase();
				return t.includes("nhanh x10") || t.includes("x10");
			});

			if (
				btnX10 &&
				(btnX10.disabled || btnX10.getAttribute("aria-disabled") === "true")
			) {
				if (run) {
					run = false;
					updateStatus("STOP");
					lg(
						"🛑 THỂ LỰC KHÔNG ĐỦ X10 (Nút Nhanh x10 bị khóa): DỪNG LỊCH LUYỆN x10!",
						"error",
					);
					return true;
				}
			}

			return false;
		}

		async function loop() {
			if (!run || wait || healing) return;
			clearHealEphemeralNotice();
			if (checkError()) return;

			var scope = getLichScope();
			var jitter = Math.floor(Math.random() * 200);
			var actionDelay = delay + 500 + jitter;

			if (isHealMode10) {
				var hpPct = parseCharacterHP(scope);
				if (hpPct !== null && hpPct < 90) {
					var hf = Array.from(
						scope.querySelectorAll('button, a, [role="button"]'),
					).find(function (x) {
						var t = (x.innerText || "").trim().toLowerCase();
						return (
							t.includes("hồi máu") ||
							t.includes("hồi phục") ||
							t.includes("phục hồi")
						);
					});

					if (hf) {
						wait = true;
						healing = true;
						lg(
							"💊 MÁU THẤP (" + hpPct.toFixed(1) + "% < 90%) -> BẤM HỒI MÁU",
							"warn",
						);
						hf.click();
						await sleep(800);
						clearHealEphemeralNotice();
						await sleep(actionDelay);
						healing = false;
						wait = false;
						return;
					}
				}
			}

			var btns = Array.from(
				scope.querySelectorAll('button, a, [role="button"]'),
			).filter(function (b) {
				if (
					b.disabled ||
					b.getAttribute("aria-disabled") === "true" ||
					!b.innerText
				)
					return false;
				var t = b.innerText.trim().toLowerCase();
				if (
					t.includes("bỏ qua tin") ||
					t.includes("dismiss") ||
					t.includes("rời đội")
				)
					return false;
				return true;
			});

			if (!btns.length) {
				var msgs = $$(
					'li[id^="chat-messages-"],[class*="messageListItem"]',
				).slice(-3);
				btns = msgs
					.flatMap(function (m) {
						return $$('button, a, [role="button"]', m);
					})
					.filter(function (b) {
						if (
							b.disabled ||
							b.getAttribute("aria-disabled") === "true" ||
							!b.innerText
						)
							return false;
						if (b.hasAttribute("data-mana-component")) return false;
						var t = b.innerText.trim().toLowerCase();
						if (
							t.includes("bỏ qua tin") ||
							t.includes("dismiss") ||
							t.includes("rời đội") ||
							t.includes("cuộc trò chuyện") ||
							t.includes("tìm hoặc") ||
							t.includes("trò chuyện")
						)
							return false;
						return true;
					})
					.reverse();
			}

			var q = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return (
					t.includes("nhanh x10") || t.includes("x10") || t.includes("nhanh 10")
				);
			});
			if (q) {
				wait = true;
				lg("⚡ NHẤN: NHANH x10", "click");
				q.click();
				await sleep(actionDelay);
				wait = false;
				return;
			}

			var s = btns.find(function (b) {
				var t = (b.innerText || b.textContent || "").trim().toLowerCase();
				return (
					(t === "bắt đầu" || t.startsWith("bắt đầu") || t.includes("bắt đầu") || t.includes("khởi hành") || t.includes("khám phá")) &&
					!t.includes("cuộc trò chuyện") &&
					!t.includes("tìm hoặc") &&
					!t.includes("trò chuyện")
				);
			});
			if (s) {
				wait = true;
				lg("✅ BẮT ĐẦU", "click");
				s.click();
				await sleep(actionDelay);
				wait = false;
				return;
			}

			var o = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				var k = ["tiếp theo", "xác nhận", "đồng ý", "ok", "đóng"];
				return k.some(function (kw) {
					return t.includes(kw);
				});
			});
			if (o) {
				wait = true;
				lg("✅ " + o.innerText.trim(), "click");
				o.click();
				await sleep(actionDelay);
				wait = false;
				return;
			}
		}

		window._lich10 = setInterval(loop, 1000);
		updateStatus("RUN");
		lg("⚡ KHỞI ĐỘNG LỊCH LUYỆN x10", "success");
	}

	function runLich() {
		if (window._lich) clearInterval(window._lich);
		var c = makeBot(
			"bl",
			'<div class="bot-header" id="blh"><div class="bot-title"><span class="bot-dot" id="statusDotL"></span>📅 LỊCH LUYỆN</div><div class="header-right"><div class="bc-delay-block">⏱️Delay<input type="number" id="ldel" value="1500" min="200" step="100" class="bc-input-ms"><span>ms</span></div><button id="bml" class="bot-btn" style="background:0 0;border:1px solid rgba(0,240,255,0.08);color:#00f0ff;font-size:14px;cursor:pointer;padding:0 6px;height:24px;">−</button></div></div><div class="bot-main-body" id="blm"><div class="btn-row"><button class="bot-btn off" id="bhealL">💊 HỒI MÁU</button><button class="bot-btn" id="btl">STOP</button><button class="bot-btn" id="bxl">THOÁT</button></div><div class="bot-footer"><div class="bot-log" id="bll"></div></div></div>',
			"#blh",
			function () {
				mainMenu();
			},
		);

		var log = $("#bll");
		var main = $("#blm");
		var min = $("#bml");
		var tog = $("#btl");
		var del = $("#ldel");
		var healBtn = $("#bhealL");
		var dot = $("#statusDotL");
		var run = true;
		var delay = 1500;
		var mini = false;
		var wait = false;
		var healing = false;
		var isHealMode = false;

		dot.className = "bot-dot green";
		min.onclick = function (e) {
			e.stopPropagation();
			mini = !mini;
			main.classList.toggle("c", mini);
			min.textContent = mini ? "+" : "−";
		};

		function lg(t, type) {
			type = type || "";
			var time = new Date().toLocaleTimeString();
			log.innerHTML +=
				'<span class="log-time">[' +
				time +
				']</span> <span class="log-' +
				type +
				'">' +
				t +
				"</span>";
			if (log.childNodes.length > 15) log.removeChild(log.firstChild);
			log.scrollTop = log.scrollHeight;
		}

		healBtn.onclick = function (e) {
			e.stopPropagation();
			isHealMode = !isHealMode;
			if (isHealMode) {
				healBtn.className = "bot-btn on";
				healBtn.innerText = "💊 HỒI MÁU (<90% HP)";
				lg("🔴 HỒI MÁU TỰ ĐỘNG: BẬT (<90% HP)", "click");
			} else {
				healBtn.className = "bot-btn off";
				healBtn.innerText = "💊 HỒI MÁU";
				lg("⚪ HỒI MÁU TỰ ĐỘNG: TẮT", "warn");
			}
		};

		function updateStatus(state) {
			dot.className = "bot-dot";
			if (state === "RUN") {
				dot.classList.add("green");
				tog.innerText = "STOP";
				tog.style.background = "linear-gradient(135deg,#00c6ff,#0072ff)";
			} else if (state === "STOP") {
				dot.classList.add("yellow");
				tog.innerText = "RUN";
				tog.style.background = "linear-gradient(135deg,#4caf50,#2e7d32)";
			}
		}

		tog.onclick = function () {
			if (run) {
				run = false;
				updateStatus("STOP");
				lg("⏸️ DỪNG", "warn");
			} else {
				run = true;
				updateStatus("RUN");
				lg("▶️ CHẠY", "success");
			}
		};

		del.oninput = function () {
			var v = parseInt(del.value) || 1500;
			delay = Math.max(200, v);
		};

		function getLichScope() {
			var embeds = Array.from(
				document.querySelectorAll(
					'article[class*="__623de"], [class*="embedFull"], [class*="markup_"]',
				),
			);
			if (!embeds.length) return document;

			var targetEmbed = null;
			for (var i = embeds.length - 1; i >= 0 && i >= embeds.length - 6; i--) {
				var emb = embeds[i];
				var txt = (emb.innerText || "").toLowerCase();
				if (
					txt.includes("lịch luyện") ||
					txt.includes("phase") ||
					txt.includes("kết quả") ||
					txt.includes("chiến lại") ||
					txt.includes("đồng minh") ||
					txt.includes("kẻ địch") ||
					txt.includes("sinh mệnh")
				) {
					targetEmbed = emb;
					break;
				}
			}

			if (!targetEmbed) targetEmbed = embeds[embeds.length - 1];

			var container =
				targetEmbed.closest('[id^="message-accessories-"]') ||
				targetEmbed.closest('[class*="container_b7e1cb"]') ||
				targetEmbed.closest('[class*="container_"]') ||
				targetEmbed.closest('li[id^="chat-messages-"]') ||
				targetEmbed.parentElement;
			return container || document;
		}

		function getCurrentStamina(scope) {
			var txt = scope.innerText || "";
			var m =
				txt.match(/Thể\s*lực[\s\S]*?(\d+)\s*\/\s*\d+/i) ||
				txt.match(/Hiện\s*có:\s*(\d+)\s*\/\s*\d+/i);
			if (m && m[1] !== undefined) {
				var val = parseInt(m[1], 10);
				if (!isNaN(val)) return val;
			}
			return null;
		}

		function parseCharacterHP(scope) {
			var txt = scope.innerText || "";
			var lines = txt.split("\n");
			for (var i = 0; i < lines.length; i++) {
				var line = lines[i].trim();
				if (
					line.includes("Sinh mệnh") ||
					line.includes("Sinh Mệnh") ||
					line.includes("Máu") ||
					line.includes("HP")
				) {
					var match = line.match(/(\d+)\s*\/\s*(\d+)/);
					if (match) {
						var curr = parseInt(match[1], 10);
						var max = parseInt(match[2], 10);
						if (!isNaN(curr) && !isNaN(max) && max > 0 && curr <= max) {
							return (curr / max) * 100;
						}
					}
				}
			}

			var generalMatch = txt.match(
				/(?:Sinh\s*mệnh|Máu|HP)[^\d]*?(\d+)\s*\/\s*(\d+)/i,
			);
			if (generalMatch) {
				var c = parseInt(generalMatch[1], 10);
				var m = parseInt(generalMatch[2], 10);
				if (!isNaN(c) && !isNaN(m) && m > 0 && c <= m) {
					return (c / m) * 100;
				}
			}

			return null;
		}

		function checkError() {
			var scope = getLichScope();

			var stamina = getCurrentStamina(scope);
			if (stamina !== null && stamina < 1) {
				if (run) {
					run = false;
					updateStatus("STOP");
					lg(
						"🛑 THỂ LỰC BẰNG 0 (Hiện có " +
							stamina +
							"): DỪNG LỊCH LUYỆN!",
						"error"
					);
					return true;
				}
			}

			var btnChiLai = Array.from(
				scope.querySelectorAll('button, a, [role="button"]')
			).find(function (b) {
				var t = (b.innerText || "").trim().toLowerCase();
				return (
					t.includes("chiến lại") ||
					t.includes("chiến tiếp") ||
					t.includes("tiếp tục") ||
					t.includes("đánh tiếp") ||
					(t.includes("bắt đầu") && !t.includes("x10"))
				);
			});

			if (
				btnChiLai &&
				(btnChiLai.disabled || btnChiLai.getAttribute("aria-disabled") === "true")
			) {
				if (run) {
					run = false;
					updateStatus("STOP");
					lg(
						"🛑 HẾT THỂ LỰC (Nút Chiến Lại bị khóa): DỪNG LỊCH LUYỆN!",
						"error"
					);
					return true;
				}
			}

			return false;
		}

		async function loop() {
			if (!run || wait || healing) return;
			clearHealEphemeralNotice();
			if (checkError()) return;

			var scope = getLichScope();
			var jitter = Math.floor(Math.random() * 200);
			var actionDelay = delay + 500 + jitter;

			if (isHealMode) {
				var hpPct = parseCharacterHP(scope);
				if (hpPct !== null && hpPct < 90) {
					var hf = Array.from(
						scope.querySelectorAll('button, a, [role="button"]'),
					).find(function (x) {
						var t = (x.innerText || "").trim().toLowerCase();
						return (
							t.includes("hồi máu") ||
							t.includes("hồi phục") ||
							t.includes("phục hồi")
						);
					});

					if (hf) {
						wait = true;
						healing = true;
						lg(
							"💊 MÁU THẤP (" + hpPct.toFixed(1) + "% < 90%) -> BẤM HỒI MÁU",
							"warn",
						);
						hf.click();
						await sleep(800);
						clearHealEphemeralNotice();
						await sleep(actionDelay);
						healing = false;
						wait = false;
						return;
					}
				}
			}

			var btns = Array.from(
				scope.querySelectorAll('button, a, [role="button"]'),
			).filter(function (b) {
				if (
					b.disabled ||
					b.getAttribute("aria-disabled") === "true" ||
					!b.innerText
				)
					return false;
				var t = b.innerText.trim().toLowerCase();
				if (
					t.includes("bỏ qua tin") ||
					t.includes("dismiss") ||
					t.includes("rời đội")
				)
					return false;
				return true;
			});

			if (!btns.length) {
				var msgs = $$(
					'li[id^="chat-messages-"],[class*="messageListItem"]',
				).slice(-3);
				btns = msgs
					.flatMap(function (m) {
						return $$('button, a, [role="button"]', m);
					})
					.filter(function (b) {
						if (
							b.disabled ||
							b.getAttribute("aria-disabled") === "true" ||
							!b.innerText
						)
							return false;
						if (b.hasAttribute("data-mana-component")) return false;
						var t = b.innerText.trim().toLowerCase();
						if (
							t.includes("bỏ qua tin") ||
							t.includes("dismiss") ||
							t.includes("rời đội") ||
							t.includes("cuộc trò chuyện") ||
							t.includes("tìm hoặc") ||
							t.includes("trò chuyện")
						)
							return false;
						return true;
					})
					.reverse();
			}

			var q = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return (
					t.includes("kết quả nhanh") ||
					t.includes("kết quả") ||
					t.includes("xem kết quả")
				);
			});
			if (q) {
				wait = true;
				lg("📊 NHẤN: KẾT QUẢ NHANH", "click");
				q.click();
				await sleep(actionDelay);
				wait = false;
				return;
			}

			var f = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return (
					t.includes("chiến lại") ||
					t.includes("chiến tiếp") ||
					t.includes("tiếp tục") ||
					t.includes("đánh tiếp")
				);
			});
			if (f) {
				wait = true;
				lg("⚔️ NHẤN: CHIẾN LẠI", "click");
				f.click();
				await sleep(actionDelay);
				wait = false;
				return;
			}

			var s = btns.find(function (b) {
				var t = (b.innerText || b.textContent || "").trim().toLowerCase();
				return (
					((t.includes("bắt đầu") && !t.includes("x10")) ||
						t.includes("khởi hành") ||
						t.includes("khám phá")) &&
					!t.includes("cuộc trò chuyện") &&
					!t.includes("tìm hoặc") &&
					!t.includes("trò chuyện")
				);
			});
			if (s) {
				wait = true;
				lg("✅ BẮT ĐẦU", "click");
				s.click();
				await sleep(actionDelay);
				wait = false;
				return;
			}

			var o = btns.find(function (b) {
				var t = b.innerText.trim().toLowerCase();
				var k = ["tiếp theo", "xác nhận", "đồng ý", "ok", "đóng"];
				return k.some(function (kw) {
					return t.includes(kw);
				});
			});
			if (o) {
				wait = true;
				lg("✅ " + o.innerText.trim(), "click");
				o.click();
				await sleep(actionDelay);
				wait = false;
				return;
			}
		}

		window._lich = setInterval(loop, 1000);
		updateStatus("RUN");
		lg("📅 KHỞI ĐỘNG LỊCH LUYỆN", "success");
		lg("⚪ HỒI MÁU TỰ ĐỘNG: TẮT", "warn");
	}

	function runLamVuon() {
		if (window._lamvuon) clearInterval(window._lamvuon);

		var html =
			'<div class="bot-header" id="lvh">' +
			'<div class="bot-title"><span class="bot-dot" id="statusDotLV"></span>🌱 AUTO LÀM VƯỜN</div>' +
			'<div class="header-right">' +
			'<button id="bmlv" class="bot-btn" style="background:0 0;border:1px solid rgba(0,240,255,0.08);color:#00f0ff;font-size:14px;cursor:pointer;padding:0 6px;height:24px;">−</button>' +
			"</div></div>" +
			'<div class="bot-main-body" id="lvm" style="max-height:500px;">' +
			'<div class="btn-row" style="margin-bottom:6px;">' +
			'<button class="bot-btn on" id="btnModeLV" style="width:100%;height:28px;font-size:10px;">🌱 FULL LÀM VƯỜN</button>' +
			"</div>" +
			'<div class="btn-row" style="margin-bottom:6px;gap:4px;">' +
			'<button class="bot-btn" id="btnTargetLinh" style="flex:1;padding:4px 0;font-size:10px;height:26px;background:linear-gradient(135deg, #00f0ff, #7b2ffc) !important; color:#fff !important; font-weight:900;">🌿 Linh</button>' +
			'<button class="bot-btn" id="btnTargetHuyen" style="flex:1;padding:4px 0;font-size:10px;height:26px;background:rgba(255,255,255,0.08); color:#aaa;">🌀 Huyền</button>' +
			'<button class="bot-btn" id="btnTargetTien" style="flex:1;padding:4px 0;font-size:10px;height:26px;background:rgba(255,255,255,0.08); color:#aaa;">🌸 Tiên</button>' +
			"</div>" +
			'<div class="btn-row" style="margin-bottom:6px;font-size:10px;justify-content:space-between;background:rgba(0,0,0,0.25);padding:4px 8px;border-radius:6px;color:#00f0ff;">' +
			"<span>Vườn:</span>" +
			'<label style="cursor:pointer;"><input type="checkbox" id="chkDan" checked> Chế Đan</label>' +
			'<label style="cursor:pointer;"><input type="checkbox" id="chkHoa" checked> Luyện Hóa</label>' +
			'<label style="cursor:pointer;"><input type="checkbox" id="chkHiem" checked> Quý Hiếm</label>' +
			"</div>" +
			'<div class="btn-row" style="margin-bottom:4px;"><button class="bot-btn" id="btlv" style="flex:1;height:28px;font-size:10px;background:linear-gradient(135deg,#ff3b30,#ff2d55) !important;">▶️ CHẠY</button><button class="bot-btn" id="bxlv" style="height:28px;font-size:10px;padding:0 14px;">THOÁT</button></div>' +
			'<div class="bot-footer">' +
			'<div style="font-size:9px;color:#00f0ff;display:flex;justify-content:space-between;margin:4px 0 2px;font-weight:600;">' +
			'<span id="wellTimerDisp">💧Giếng: READY</span>' +
			'<span id="spiritDisp">🔸Trận: --</span>' +
			"</div>" +
			'<div style="font-size:9px;color:#ffd700;display:flex;justify-content:space-between;margin:2px 0 4px;font-weight:600;background:rgba(0,0,0,0.3);padding:3px 6px;border-radius:4px;">' +
			'<span id="cdDanDisp">🧪Đan: READY</span>' +
			'<span id="cdHoaDisp">🌀Hóa: READY</span>' +
			'<span id="cdHiemDisp">🌸Hiếm: READY</span>' +
			"</div>" +
			'<div class="bot-log" id="bllv" style="height:110px;font-size:10px;line-height:1.4;"></div>' +
			"</div></div>";

		var c = makeBot("lv", html, "#lvh", function () {
			mainMenu();
		});
		c.style.width = "310px";

		var log = $("#bllv");
		var main = $("#lvm");
		var min = $("#bmlv");
		var tog = $("#btlv");
		var dot = $("#statusDotLV");
		var btnMode = $("#btnModeLV");
		var btnTargetLinh = $("#btnTargetLinh");
		var btnTargetHuyen = $("#btnTargetHuyen");
		var btnTargetTien = $("#btnTargetTien");
		var chkDan = $("#chkDan");
		var chkHoa = $("#chkHoa");
		var chkHiem = $("#chkHiem");
		var wellTimerDisp = $("#wellTimerDisp");
		var spiritDisp = $("#spiritDisp");
		var cdDanDisp = $("#cdDanDisp");
		var cdHoaDisp = $("#cdHoaDisp");
		var cdHiemDisp = $("#cdHiemDisp");

		var run = false;
		var wait = false;
		var isFullMode = true;
		var targetDVIndex = 0;
		var dvNames = ["Dược Viên Linh", "Dược Viên Huyền", "Dược Viên Tiên"];

		var hasCuLinhTran = false;
		var wellCDUntil = 0;
		var gardenCDs = {};
		var gardenDoneState = {};

		var waterDone = false;
		var fertilizerDone = false;

		dot.className = "bot-dot yellow";

		btnMode.onclick = function (e) {
			e.stopPropagation();
			isFullMode = !isFullMode;
			if (isFullMode) {
				btnMode.className = "bot-btn on";
				btnMode.innerText = "🌱 FULL LÀM VƯỜN";
				lg("🔴 CHẾ ĐỘ: FULL LÀM VƯỜN", "click");
			} else {
				btnMode.className = "bot-btn off";
				btnMode.innerText = "💧 CHỈ MÚC NƯỚC";
				lg("⚪ CHẾ ĐỘ: CHỈ MÚC NƯỚC", "warn");
			}
		};

		function setTargetDV(idx) {
			targetDVIndex = idx;
			var activeStyle =
				"flex:1;padding:4px 0;font-size:10px;height:26px;background:linear-gradient(135deg, #00f0ff, #7b2ffc) !important; color:#fff !important; font-weight:900; box-shadow:0 0 8px rgba(0,240,255,0.4);";
			var inactiveStyle =
				"flex:1;padding:4px 0;font-size:10px;height:26px;background:rgba(255,255,255,0.08); color:#aaa; font-weight:normal; box-shadow:none;";

			btnTargetLinh.style.cssText = idx === 0 ? activeStyle : inactiveStyle;
			btnTargetHuyen.style.cssText = idx === 1 ? activeStyle : inactiveStyle;
			btnTargetTien.style.cssText = idx === 2 ? activeStyle : inactiveStyle;

			lg("🎯 ĐỔI DƯỢC VIÊN TARGET: " + dvNames[idx], "click");
		}

		btnTargetLinh.onclick = function (e) {
			e.stopPropagation();
			setTargetDV(0);
		};
		btnTargetHuyen.onclick = function (e) {
			e.stopPropagation();
			setTargetDV(1);
		};
		btnTargetTien.onclick = function (e) {
			e.stopPropagation();
			setTargetDV(2);
		};

		function lg(t, type) {
			type = type || "";
			var time = new Date().toLocaleTimeString();
			log.innerHTML +=
				'<span class="log-time">[' +
				time +
				']</span> <span class="log-' +
				type +
				'">' +
				t +
				"</span>";
			if (log.childNodes.length > 15) log.removeChild(log.firstChild);
			log.scrollTop = log.scrollHeight;
		}

		function updateStatus(state) {
			dot.className = "bot-dot";
			if (state === "RUN") {
				dot.classList.add("green");
				tog.innerText = "STOP";
				tog.style.background = "linear-gradient(135deg,#4caf50,#2e7d32)";
			} else if (state === "STOP") {
				dot.classList.add("yellow");
				tog.innerText = "▶️ CHẠY";
				tog.style.background = "linear-gradient(135deg,#ff3b30,#ff2d55)";
			}
		}

		tog.onclick = function () {
			if (run) {
				run = false;
				updateStatus("STOP");
				lg("⏸️ DỪNG", "warn");
			} else {
				run = true;
				updateStatus("RUN");
				lg("▶️ CHẠY", "success");
			}
		};

		function getGardenScope() {
			var embeds = Array.from(
				document.querySelectorAll('article[class*="__623de"]'),
			);
			if (!embeds.length) return document;

			var targetEmbed = null;
			for (var i = embeds.length - 1; i >= 0 && i >= embeds.length - 5; i--) {
				var emb = embeds[i];
				var txt = (emb.innerText || "").toLowerCase();
				if (
					txt.includes("dược viên") ||
					txt.includes("phân khu") ||
					txt.includes("múc nước") ||
					txt.includes("chế đan") ||
					txt.includes("luyện hóa") ||
					txt.includes("quý hiếm")
				) {
					targetEmbed = emb;
					break;
				}
			}

			if (!targetEmbed) targetEmbed = embeds[embeds.length - 1];

			var container =
				targetEmbed.closest('[class*="container_"]') ||
				targetEmbed.closest('[id^="message-accessories-"]') ||
				targetEmbed.parentElement;
			return container || document;
		}

		function getCurrentGardenPage(scope) {
			var btns = Array.from(
				scope.querySelectorAll('button, a, [role="button"]'),
			).filter(function (b) {
				return b.innerText;
			});

			var isPage3 = btns.some(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return t.includes("quay lại phân khu") || t.includes("bắt sâu aoe");
			});
			if (isPage3) return 3;

			var isPage2 = btns.some(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return t.includes("quay lại dược viên") || t.includes("vườn chế đan");
			});
			if (isPage2) return 2;

			var isPage1 = btns.some(function (b) {
				var t = b.innerText.trim().toLowerCase();
				return t.includes("múc nước giếng") || t.includes("dược viên linh");
			});
			if (isPage1) return 1;

			return 0;
		}

		function parsePage2EmptyGardens(scope) {
			var text = scope.innerText || "";
			var res = {};
			var subGardens = ["Vườn Chế Đan", "Vườn Luyện Hóa", "Vườn Quý Hiếm"];
			subGardens.forEach(function (sg) {
				var idx = text.indexOf(sg);
				if (idx !== -1) {
					var snippet = text.slice(idx, idx + 100);
					if (snippet.includes("Đất trồng: 0/")) {
						res[sg] = true;
					} else {
						res[sg] = false;
					}
				}
			});
			return res;
		}

		function getPlantStageRank(str) {
			var s = (str || "").toLowerCase();
			if (s.includes("chín muồi")) return 4;
			if (s.includes("cây lớn")) return 3;
			if (s.includes("cây non")) return 2;
			if (s.includes("nảy mầm")) return 1;
			if (s.includes("hạt giống")) return 0;
			return -1;
		}

		function parsePage3LandStatus(scope) {
			var text = scope.innerText || "";
			var waterList = [];
			var fertList = [];
			var stageList = [];

			var waterRegex = /(\d+)\s*\/\s*5/g;
			var matchW;
			while ((matchW = waterRegex.exec(text)) !== null) {
				var val = parseInt(matchW[1], 10);
				if (!isNaN(val)) waterList.push(val);
			}

			var fertRegex = /(\d+)\s*\/\s*6/g;
			var matchF;
			while ((matchF = fertRegex.exec(text)) !== null) {
				var val = parseInt(matchF[1], 10);
				if (!isNaN(val)) fertList.push(val);
			}

			var lines = text.split("\n");
			lines.forEach(function (line) {
				var lLower = line.toLowerCase();
				if (lLower.includes("ô ") && lLower.includes(":")) {
					stageList.push(getPlantStageRank(line));
				}
			});

			var textLower = text.toLowerCase();
			var plotMatches = textLower.match(/ô\s*\d+:/g) || [];
			var totalPlots = plotMatches.length;

			var ripeMatches = textLower.match(/\(chín muồi\)/g) || [];
			var ripeCount = ripeMatches.length;

			var isRipe80Percent = totalPlots > 0 && ripeCount / totalPlots >= 0.8;
			var hasPlants =
				waterList.length > 0 || fertList.length > 0 || ripeCount > 0;
			var needWater =
				hasPlants &&
				waterList.some(function (v) {
					return v < 5;
				});
			var needFertilizer =
				hasPlants &&
				fertList.some(function (v) {
					return v < 6;
				});

			return {
				needWater: needWater,
				needFertilizer: needFertilizer,
				waterList: waterList,
				fertList: fertList,
				stageList: stageList,
				hasPlants: hasPlants,
				totalPlots: totalPlots,
				ripeCount: ripeCount,
				isRipe80Percent: isRipe80Percent,
			};
		}

		function clearEphemeralMessages() {
			var btns = Array.from(
				document.querySelectorAll('button, [role="button"], a'),
			).filter(function (b) {
				var t = (b.innerText || "").trim().toLowerCase();
				return (
					t === "bỏ qua tin nhắn" ||
					t === "bỏ qua tin" ||
					t === "xóa tin nhắn" ||
					t === "dismiss message" ||
					t.includes("bỏ qua tin") ||
					t.includes("xóa tin")
				);
			});

			btns.forEach(function (btn) {
				var msg =
					btn.closest('[class*="message_"]') ||
					btn.closest('[class*="container_"]') ||
					btn.parentElement;
				if (msg) {
					var txt = (msg.innerText || "").toLowerCase();
					var isGardenEmbed =
						txt.includes("dược viên") ||
						txt.includes("phân khu") ||
						txt.includes("vườn chế đan") ||
						txt.includes("vườn luyện hóa") ||
						txt.includes("vườn quý hiếm");
					if (!isGardenEmbed) {
						btn.click();
					}
				}
			});
		}

		async function loop() {
			if (!run || wait) return;

			clearEphemeralMessages();

			var scope = getGardenScope();
			var page = getCurrentGardenPage(scope);
			var now = Date.now();

			if (wellCDUntil > now) {
				var secLeft = Math.ceil((wellCDUntil - now) / 1000);
				wellTimerDisp.innerText = "💧Giếng: " + secLeft + "s";
			} else {
				wellTimerDisp.innerText = "💧Giếng: READY";
			}
			spiritDisp.innerText = hasCuLinhTran ? "🔸Trận: BẬT" : "🔸Trận: TẮT";

			var targetDV = dvNames[targetDVIndex];
			var keyDan = targetDV + "_Vườn Chế Đan";
			var keyHoa = targetDV + "_Vườn Luyện Hóa";
			var keyHiem = targetDV + "_Vườn Quý Hiếm";

			function formatCD(cdTime) {
				if (cdTime === Infinity) return "🌾 CHÍN";
				if (!cdTime || cdTime <= now) return "READY";
				var secLeft = Math.ceil((cdTime - now) / 1000);
				var m = Math.floor(secLeft / 60);
				var s = secLeft % 60;
				return (m > 0 ? m + "m" : "") + s + "s";
			}

			cdDanDisp.innerText = "🧪Đan: " + formatCD(gardenCDs[keyDan]);
			cdHoaDisp.innerText = "🌀Hóa: " + formatCD(gardenCDs[keyHoa]);
			cdHiemDisp.innerText = "🌸Hiếm: " + formatCD(gardenCDs[keyHiem]);

			if (page === 1) {
				var textP1 = scope.innerText || "";
				if (textP1.includes("Cụ Linh Trận")) {
					if (!hasCuLinhTran) {
						hasCuLinhTran = true;
						lg("✨ PHÁT HIỆN: Cụ Linh Trận (CD 4m35s)", "success");
					}
				} else {
					if (hasCuLinhTran) {
						hasCuLinhTran = false;
						lg("⚪ Cụ Linh Trận: Không hoạt động (CD 9m)", "warn");
					}
				}

				var btnWell = Array.from(
					scope.querySelectorAll('button, a, [role="button"]'),
				).find(function (b) {
					return b.innerText.includes("Múc Nước Giếng");
				});

				var wellReadyText = textP1.includes("Sẵn sàng múc nước linh khí!");
				var canWell =
					btnWell && !btnWell.disabled && (wellReadyText || wellCDUntil <= now);

				if (canWell) {
					wait = true;
					lg("💧 NHẤN: Múc Nước Giếng", "click");
					btnWell.click();
					wellCDUntil = Date.now() + 605000;
					await sleep(2500);
					wait = false;
					return;
				}

				if (wellCDUntil <= now) {
					var btnRefreshWell = Array.from(
						scope.querySelectorAll('button, a, [role="button"]'),
					).find(function (b) {
						return b.innerText.includes("Làm Mới");
					});
					if (btnRefreshWell) {
						wait = true;
						lg("🔄 HẾT CD GIẾNG: Bấm Làm Mới Trang 1", "click");
						btnRefreshWell.click();
						await sleep(2500);
						wait = false;
						return;
					}
				}

				var subGardenList = [];
				if (chkDan.checked) subGardenList.push("Vườn Chế Đan");
				if (chkHoa.checked) subGardenList.push("Vườn Luyện Hóa");
				if (chkHiem.checked) subGardenList.push("Vườn Quý Hiếm");

				var hasReadyGarden = subGardenList.some(function (sgName) {
					var key = targetDV + "_" + sgName;
					var cd = gardenCDs[key] || 0;
					if (cd <= now && cd !== Infinity) {
						gardenDoneState[key] = false;
					}
					return !gardenDoneState[key] && (gardenCDs[key] || 0) <= now;
				});

				if (!hasReadyGarden) {
					var minCDLeft = Infinity;
					subGardenList.forEach(function (sgName) {
						var key = targetDV + "_" + sgName;
						var cd = gardenCDs[key] || 0;
						if (cd > now && cd !== Infinity) {
							minCDLeft = Math.min(minCDLeft, cd - now);
						}
					});

					if (minCDLeft !== Infinity && minCDLeft <= 0) {
						var btnRefreshT1 = Array.from(
							scope.querySelectorAll('button, a, [role="button"]'),
						).find(function (b) {
							return b.innerText.includes("Làm Mới");
						});
						if (btnRefreshT1) {
							wait = true;
							lg("🔄 HẾT CD VƯỜN: Bấm Làm Mới Trang 1", "click");
							btnRefreshT1.click();
							await sleep(2500);
							wait = false;
							return;
						}
					}
					return;
				}

				var btnDV = Array.from(
					scope.querySelectorAll('button, a, [role="button"]'),
				).find(function (b) {
					return b.innerText.includes(targetDV);
				});

				if (btnDV) {
					wait = true;
					lg("🌿 NHẤN: " + targetDV, "click");
					btnDV.click();
					await sleep(2500);
					wait = false;
					return;
				}
			}

			if (page === 2) {
				var emptyMap = parsePage2EmptyGardens(scope);
				var subGardenList = [];
				if (chkDan.checked) subGardenList.push("Vườn Chế Đan");
				if (chkHoa.checked) subGardenList.push("Vườn Luyện Hóa");
				if (chkHiem.checked) subGardenList.push("Vườn Quý Hiếm");

				var nextGarden = null;
				for (var i = 0; i < subGardenList.length; i++) {
					var sgName = subGardenList[i];
					var key = targetDV + "_" + sgName;
					if (!gardenDoneState[key] && (gardenCDs[key] || 0) <= now) {
						nextGarden = sgName;
						break;
					}
				}

				if (nextGarden) {
					var keyTarget = targetDV + "_" + nextGarden;
					if (emptyMap[nextGarden] === true) {
						lg("⚠️ " + nextGarden + " TRỐNG (0 ô đất) -> BỎ QUA", "warn");
						gardenDoneState[keyTarget] = true;
						return;
					}

					var btnSG = Array.from(
						scope.querySelectorAll('button, a, [role="button"]'),
					).find(function (b) {
						return b.innerText.includes(nextGarden);
					});

					if (btnSG) {
						wait = true;
						lg("🌸 NHẤN VÀO: " + nextGarden, "click");
						btnSG.click();
						waterDone = false;
						fertilizerDone = false;
						await sleep(2500);
						wait = false;
						return;
					}
				} else {
					var btnBackDV = Array.from(
						scope.querySelectorAll('button, a, [role="button"]'),
					).find(function (b) {
						return b.innerText.includes("Quay Lại Dược Viên");
					});

					if (btnBackDV) {
						wait = true;
						lg("🏠 HOÀN THÀNH TẤT CẢ VƯỜN: Quay Lại Dược Viên", "success");
						btnBackDV.click();
						await sleep(2500);
						wait = false;
						return;
					}
				}
			}

			if (page === 3) {
				var currentSGName = "Vườn";
				var titleElem = scope.querySelector('[class*="embedTitle"]');
				if (titleElem) {
					var tText = titleElem.innerText || "";
					if (tText.includes("Chế Đan")) currentSGName = "Vườn Chế Đan";
					else if (tText.includes("Luyện Hóa"))
						currentSGName = "Vườn Luyện Hóa";
					else if (tText.includes("Quý Hiếm")) currentSGName = "Vườn Quý Hiếm";
				}

				var keyCurrent = targetDV + "_" + currentSGName;
				var landStatus = parsePage3LandStatus(scope);

				if (landStatus.isRipe80Percent) {
					lg(
						"🌾 " +
							currentSGName +
							" CHÍN MUỒI (" +
							landStatus.ripeCount +
							"/" +
							landStatus.totalPlots +
							" ô >= 80%)!",
						"success",
					);

					var btnHarvest = Array.from(
						scope.querySelectorAll('button, a, [role="button"]'),
					).find(function (b) {
						var t = (b.innerText || "").trim().toLowerCase();
						return t.includes("thu hoạch aoe") || t.includes("thu hoạch");
					});

					if (btnHarvest && !btnHarvest.disabled) {
						wait = true;
						lg("🌾 NHẤN: Thu Hoạch AOE (Tự động gặt cây chín)", "click");
						btnHarvest.click();
						await sleep(2500);
						wait = false;
					}

					if (currentSGName === "Vườn Chế Đan") chkDan.checked = false;
					if (currentSGName === "Vườn Luyện Hóa") chkHoa.checked = false;
					if (currentSGName === "Vườn Quý Hiếm") chkHiem.checked = false;

					gardenCDs[keyCurrent] = Infinity;
					gardenDoneState[keyCurrent] = true;

					var btnBackPKRipe = Array.from(
						scope.querySelectorAll('button, a, [role="button"]'),
					).find(function (b) {
						return (
							b.innerText.includes("Quay Lại Phân Khu") ||
							b.innerText.includes("Quay Lại")
						);
					});

					if (btnBackPKRipe) {
						wait = true;
						lg("↩️ NHẤN: Quay Lại Phân Khu (Đã Thu Hoạch)", "click");
						btnBackPKRipe.click();
						await sleep(2500);
						wait = false;
						return;
					}
				}

				var btnBug = Array.from(
					scope.querySelectorAll('button, a, [role="button"]'),
				).find(function (b) {
					return b.innerText.includes("Bắt Sâu AOE");
				});

				if (btnBug && !btnBug.disabled) {
					wait = true;
					lg("🐛 NHẤN: Bắt Sâu AOE (Kim)", "click");
					btnBug.click();
					await sleep(1500);
					wait = false;
					return;
				}

				if (landStatus.hasPlants && landStatus.needWater && !waterDone) {
					var btnWater = Array.from(
						scope.querySelectorAll('button, a, [role="button"]'),
					).find(function (b) {
						return b.innerText.includes("Tưới Nước AOE");
					});
					if (btnWater && !btnWater.disabled) {
						wait = true;
						lg("💧 NHẤN: Tưới Nước AOE (Thủy)", "click");
						var prevWaterList = landStatus.waterList;
						var prevStageList = landStatus.stageList;
						btnWater.click();
						await sleep(2500);

						var newScope = getGardenScope();
						var newStatus = parsePage3LandStatus(newScope);
						var waterSuccess = newStatus.waterList.some(function (v, idx) {
							var prev = prevWaterList[idx];
							var pStage = prevStageList[idx];
							var nStage = newStatus.stageList[idx];
							if (
								pStage !== undefined &&
								nStage !== undefined &&
								nStage > pStage
							)
								return true;
							if (prev === undefined) return true;
							return v > prev || (prev >= 4 && v === 0);
						});

						if (
							waterSuccess ||
							!newStatus.needWater ||
							newStatus.isRipe80Percent
						) {
							waterDone = true;
							lg("✅ TƯỚI NƯỚC THÀNH CÔNG (+1 ẩm / lớn lên)", "success");
						} else {
							lg("⚠️ THỬ LẠI: Tưới nước chưa tăng chỉ số!", "warn");
						}
						wait = false;
						return;
					}
				} else if (!landStatus.hasPlants || !landStatus.needWater) {
					waterDone = true;
				}

				if (
					landStatus.hasPlants &&
					landStatus.needFertilizer &&
					!fertilizerDone
				) {
					var btnFert = Array.from(
						scope.querySelectorAll('button, a, [role="button"]'),
					).find(function (b) {
						return b.innerText.includes("Bón Phân AOE");
					});
					if (btnFert && !btnFert.disabled) {
						wait = true;
						lg("🪱 NHẤN: Bón Phân AOE (Thổ)", "click");
						var prevFertList = landStatus.fertList;
						var prevStageList = landStatus.stageList;
						btnFert.click();
						await sleep(2500);

						var newScope = getGardenScope();
						var newStatus = parsePage3LandStatus(newScope);
						var fertSuccess = newStatus.fertList.some(function (v, idx) {
							var prev = prevFertList[idx];
							var pStage = prevStageList[idx];
							var nStage = newStatus.stageList[idx];
							if (
								pStage !== undefined &&
								nStage !== undefined &&
								nStage > pStage
							)
								return true;
							if (prev === undefined) return true;
							return v > prev || (prev >= 5 && v === 0);
						});

						if (
							fertSuccess ||
							!newStatus.needFertilizer ||
							newStatus.isRipe80Percent
						) {
							fertilizerDone = true;
							lg("✅ BÓN PHÂN THÀNH CÔNG (+1 phân / lớn lên)", "success");
						} else {
							lg("⚠️ THỬ LẠI: Bón phân chưa tăng chỉ số!", "warn");
						}
						wait = false;
						return;
					}
				} else if (!landStatus.hasPlants || !landStatus.needFertilizer) {
					fertilizerDone = true;
				}

				if (waterDone && fertilizerDone) {
					var cdMs = hasCuLinhTran ? 275000 : 540000;
					gardenCDs[keyCurrent] = Date.now() + cdMs;
					gardenDoneState[keyCurrent] = true;
					lg(
						"✅ XONG " +
							keyCurrent +
							" -> SET CD " +
							(hasCuLinhTran ? "4m35s" : "9m"),
						"success",
					);

					var btnBackPK = Array.from(
						scope.querySelectorAll('button, a, [role="button"]'),
					).find(function (b) {
						return (
							b.innerText.includes("Quay Lại Phân Khu") ||
							b.innerText.includes("Quay Lại")
						);
					});

					if (btnBackPK) {
						wait = true;
						lg("↩️ NHẤN: Quay Lại Phân Khu", "click");
						btnBackPK.click();
						await sleep(2500);
						wait = false;
						return;
					}
				}
			}
		}

		window._lamvuon = setInterval(loop, 1000);
		updateStatus("STOP");
		lg("🌱 BẢNG LÀM VƯỜN MỞ (SẴN SÀNG - BẤM CHẠY)", "success");
	}

	mainMenu();
})();
