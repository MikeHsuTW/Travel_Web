(function () {
    'use strict';

    const vault = window.__LAYLA_VAULT__;
    const loginPanel = document.getElementById('login-panel');
    const privatePanel = document.getElementById('private-panel');
    const form = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const revealButton = document.getElementById('reveal-password');
    const loginButton = document.getElementById('login-button');
    const message = document.getElementById('form-message');
    const logoutButton = document.getElementById('logout-button');
    let imageUrl = '';

    function fromBase64(value) {
        const binary = atob(value);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
        return bytes;
    }

    async function deriveWrappingKey(password, salt) {
        const material = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(password),
            'PBKDF2',
            false,
            ['deriveKey']
        );
        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt,
                iterations: vault.kdf.iterations,
                hash: vault.kdf.hash
            },
            material,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );
    }

    async function decryptContent(username, password) {
        if (!vault || vault.version !== 1) throw new Error('VAULT_UNAVAILABLE');
        const normalizedName = username.trim().toLowerCase();
        const user = vault.users.find((item) => item.username === normalizedName);
        if (!user) throw new Error('LOGIN_FAILED');

        const wrappingKey = await deriveWrappingKey(password, fromBase64(user.salt));
        const rawContentKey = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: fromBase64(user.wrapIv) },
            wrappingKey,
            fromBase64(user.wrappedKey)
        );
        const contentKey = await crypto.subtle.importKey(
            'raw',
            rawContentKey,
            { name: 'AES-GCM' },
            false,
            ['decrypt']
        );
        const clearContent = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: fromBase64(vault.content.iv) },
            contentKey,
            fromBase64(vault.content.ciphertext)
        );
        return JSON.parse(new TextDecoder().decode(clearContent));
    }

    function showPrivateContent(content) {
        if (!content.pageHtml || !content.assets) throw new Error('CONTENT_UNAVAILABLE');
        passwordInput.value = '';
        let page = content.pageHtml;
        const urls = [];
        for (const name of Object.keys(content.assets).sort((a,b) => b.length-a.length)) {
            const asset = content.assets[name];
            const url = URL.createObjectURL(new Blob([fromBase64(asset.data)], {type: asset.mime}));
            urls.push(url);
            page = page.split(name).join(url);
        }
        document.open(); document.write(page); document.close();
        window.addEventListener('pagehide', () => urls.forEach(url => URL.revokeObjectURL(url)), {once: true});
    }

    function logout() {
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        imageUrl = '';
        privatePanel.hidden = true;
        loginPanel.hidden = false;
        form.reset();
        message.textContent = '';
        document.title = 'Private Space';
        usernameInput.focus();
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        message.textContent = '';
        if (!usernameInput.value.trim() || !passwordInput.value) {
            message.textContent = '請輸入帳號與密碼。';
            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = '解鎖中...';
        try {
            const content = await decryptContent(usernameInput.value, passwordInput.value);
            loginButton.disabled = false;
            loginButton.textContent = '登入';
            showPrivateContent(content);
        } catch (error) {
            message.textContent = error.message === 'VAULT_UNAVAILABLE'
                ? '私人內容尚未初始化。'
                : '帳號或密碼不正確。';
            passwordInput.select();
        } finally {
            loginButton.disabled = false;
            loginButton.textContent = '登入';
        }
    });

    revealButton.addEventListener('click', () => {
        const show = passwordInput.type === 'password';
        passwordInput.type = show ? 'text' : 'password';
        revealButton.textContent = show ? '隱藏' : '顯示';
        revealButton.setAttribute('aria-label', show ? '隱藏密碼' : '顯示密碼');
        passwordInput.focus();
    });

    logoutButton.addEventListener('click', logout);
    usernameInput.focus();
})();
