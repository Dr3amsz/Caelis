
// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});


async function initializeApp() {
    console.log("Inisialisasi dimulai...");
    try {
        const response = await fetch('backend/check_auth.php');
        if (!response.ok) throw new Error("File backend tidak ditemukan");
        
        const result = await response.json();
        console.log("Status Server:", result);

        if (result.status === 'logged_in') {
            // GUNAKAN GLOBAL OBJECT
            window.currentUser = result.user; 
            
            loadProfile();
            // Panggil UI
            showAuthenticatedUI(result.user);
            
            // PAKSA LOAD FEED
            loadFeed(); 
             
            // Jika sedang di halaman profil, paksa load profil
            if (document.getElementById('profilePage')?.classList.contains('active')) {
                loadProfile();
            }
        } else {
            showUnauthenticatedUI();
            showPage('landing');
        }
    } catch (error) {
        console.error("CRASH saat inisialisasi:", error);
        showPage('landing');
    }
}

function setupEventListeners() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) registerForm.addEventListener('submit', handleRegister);

    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) editProfileForm.addEventListener('submit', handleEditProfile);

    const postImageInput = document.getElementById('postImage');
    if (postImageInput) postImageInput.addEventListener('change', previewPostImage);
}

// Page Navigation
// Page Navigation
function showPage(pageName) {
    // Sembunyikan semua halaman
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });

    // Tampilkan halaman yang dipilih
    const targetPage = document.getElementById(pageName + 'Page');
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // TRIGGER PANGGILAN NETWORK DI SINI:
    if (pageName === 'feed') {
        loadFeed(); // Memuat postingan
        renderSuggestedUsers(); // <--- TAMBAHKAN BARIS INI UNTUK MEMUAT SARAN TEMAN
        loadSuggestedUsers();
    } else if (pageName === 'profile') {
        loadProfile(); 
    }
}

// UI State Management
function showAuthenticatedUI(user) {
    // Navigasi
    const navHome = document.getElementById('navHome');
    const navProfile = document.getElementById('navProfile');
    const navLogout = document.getElementById('navLogout');
    const navLogin = document.getElementById('navLogin');
    const navRegister = document.getElementById('navRegister');
    
    if (navHome) navHome.classList.remove('d-none');
    if (navProfile) navProfile.classList.remove('d-none');
    if (navLogout) navLogout.classList.remove('d-none');
    if (navLogin) navLogin.classList.add('d-none');
    if (navRegister) navRegister.classList.add('d-none');

    // JIKA USER ADA (DARI PHP), UPDATE UI DAN PINDAH HALAMAN
    if (user && typeof updateUserUI === 'function') {
        updateUserUI(user);
    }
}

function showUnauthenticatedUI() {
    const navHome = document.getElementById('navHome');
    const navProfile = document.getElementById('navProfile');
    const navLogout = document.getElementById('navLogout');
    const navLogin = document.getElementById('navLogin');
    const navRegister = document.getElementById('navRegister');
    
    if (navHome) navHome.classList.add('d-none');
    if (navProfile) navProfile.classList.add('d-none');
    if (navLogout) navLogout.classList.add('d-none');
    if (navLogin) navLogin.classList.remove('d-none');
    if (navRegister) navRegister.classList.remove('d-none');
}

function updateUserUI(user) {
    if (!user) return; // Tambahkan ini agar tidak error 'undefined'

    const sidebarName = document.getElementById('sidebarUserName');
    const sidebarEmail = document.getElementById('sidebarUserEmail');
    const sidebarImg = document.getElementById('sidebarProfileImg');

    if (sidebarName) sidebarName.textContent = user.name || 'User';
    if (sidebarEmail) sidebarEmail.textContent = user.email || ''; 
    
    if (sidebarImg) {
        // Pastikan nama properti sesuai dengan kolom di database MySQL (profile_img)
        sidebarImg.src = user.profile_img ? `backend/uploads/${user.profile_img}` : generateAvatar(user.name || 'U');
    }
}

// Authentication
async function handleRegister(e) {
    e.preventDefault();
    const formElement = document.getElementById('registerForm');
    const formData = new FormData(formElement);
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (formData.get('password').length < 6) return showNotification('Password minimal 6 karakter!', 'error');
    if (formData.get('password') !== confirmPassword) return showNotification('Password tidak cocok!', 'error');

    try {
        const response = await fetch('backend/register.php', {
            method: 'POST',
            body: formData
        });
        const resultText = await response.text();

        if (resultText.trim() === 'sukses') {
            showNotification('Registrasi berhasil! Silakan login.', 'success');
            formElement.reset();
            showPage('login');
        } else {
            showNotification(resultText, 'error'); // Tampilkan pesan error dari PHP
        }
    } catch (error) {
        showNotification('Terjadi kesalahan koneksi server.', 'error');
    }
}

async function handleLogin(e) {
    e.preventDefault(); // Mencegah halaman refresh bawaan browser
    
    const formElement = document.getElementById('loginForm');
    const formData = new FormData(formElement);

    try {
        const response = await fetch('backend/login.php', {
            method: 'POST',
            body: formData
        });
        
        // KITA GUNAKAN .text() KARENA PHP ANDA MENGIRIM TEKS 'sukses'
        const resultText = await response.text();

        if (resultText.trim() === 'sukses') {
            showNotification('Selamat datang kembali! 🎉', 'success');
            
            // --- INI KUNCINYA AGAR TIDAK PERLU REFRESH ---
            // Memanggil initializeApp akan otomatis mengecek session baru, 
            // lalu memindahkan layar ke feed secara instan!
            await initializeApp(); 
            showPage('feed');
            
        } else {
            // Tampilkan pesan error jika login salah (misal: password salah)
            showNotification(resultText, 'error');
        }
    } catch (error) {
        console.error('Error Fetch:', error);
        showNotification('Terjadi kesalahan koneksi server.', 'error');
    }
}

async function handleLogout(event) {
    // Mencegah halaman refresh jika tombol berada di dalam tag <a> atau <form>
    if (event) event.preventDefault(); 

    if (confirm('Yakin pengen keluar? 👋')) {
        try {
            // Panggil PHP untuk menghapus session di server
            const response = await fetch('backend/logout.php');
            
            // Gunakan response.json() karena logout.php kita mengirim format JSON
            const result = await response.json();

            if (result.status === 'success') {
                // Hapus data sisa di browser
                window.currentUser = null;
                localStorage.clear(); 

                // PAKSA KEMBALI KE HALAMAN UTAMA (LOGIN/DAFTAR)
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Error saat logout:', error);
            alert('Gagal keluar, terjadi kesalahan server.');
        }
    }
}




// Render Saran Teman (User lain di database)
// Fitur Search (Pencarian User)
function searchUsers() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    renderSuggestedUsers(keyword);
}

// Render Saran Teman & Hasil Pencarian
async function renderSuggestedUsers(searchKeyword = '') {
    const container = document.getElementById('suggestedUsersContainer');
    if (!container) return;

    try {
        const response = await fetch('./backend/get_users.php');
        const result = await response.json();

        if (result.status === 'success') {
            let suggested = result.users;
            const following = result.following || [];

            // Filter pencarian jika ada
            if (searchKeyword) {
                suggested = suggested.filter(u => u.name.toLowerCase().includes(searchKeyword.toLowerCase()));
            }

            if (suggested.length === 0) {
                container.innerHTML = '<p class="text-muted small text-center my-3">Pengguna tidak ditemukan.</p>';
                return;
            }

            container.innerHTML = suggested.map(user => {
                // Pengecekan status Follow
                const isFollowing = following.includes(user.id) || following.includes(String(user.id));
                const btnClass = isFollowing ? 'btn-outline-secondary' : 'btn-primary';
                const btnText = isFollowing ? 'Diikuti' : 'Ikuti';
                const icon = isFollowing ? 'bi-check2' : 'bi-person-plus-fill';
                
                // Pengecekan Foto Profil
                const profileImg = (user.profile_img && user.profile_img !== 'default.jpg') 
                                    ? `backend/uploads/${user.profile_img}` 
                                    : generateAvatar(user.name);
                
                return `
                    <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                        <div class="d-flex align-items-center gap-2" onclick="viewUserProfile(${user.id})" style="cursor: pointer;" title="Lihat profil ${user.name}">
                            <img src="${profileImg}" class="rounded-circle" width="40" height="40" style="object-fit:cover;">
                            <div>
                                <h6 class="mb-0 fw-bold" style="font-size:0.9rem;">${user.name}</h6>
                            </div>
                        </div>
                        <button class="btn btn-sm rounded-pill px-3 ${btnClass}" onclick="toggleFollow('${user.id}', this)" style="font-size:0.8rem; font-weight:600;">
                            <i class="bi ${icon} me-1"></i> ${btnText}
                        </button>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error("Gagal memuat saran teman:", error);
    }
}

// Load Suggested Users (untuk sidebar)
function loadSuggestedUsers() {
    renderSuggestedUsers();
}


// Post Functions
function openCreatePostModal(type) {
    const modal = new bootstrap.Modal(document.getElementById('createPostModal'));
    modal.show();
    document.getElementById('postContent').focus();
}

// --- MENAMPILKAN FEED DARI DATABASE ---
async function loadFeed() {
    const postsContainer = document.getElementById('postsContainer');
    if (!postsContainer) return;

    try {
        const response = await fetch('backend/get_feed.php');
        
        // DEBUG: Cek apakah response OK (status 200)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
            const posts = result.posts;
            loadSuggestedUsers();
            if (posts.length === 0) {
                postsContainer.innerHTML = '<p class="text-center text-muted my-5">Belum ada postingan.</p>';
                return;
            }
            const currentUserId = window.currentUser ? window.currentUser.id : null;
            postsContainer.innerHTML = posts.map(post => createPostHTML(post, currentUserId)).join('');
        } else {
            postsContainer.innerHTML = `<p class="text-center text-danger">${result.message}</p>`;
        }
    } catch (error) {
        console.error("Detail Error Feed:", error); // Lihat detailnya di Console F12!
        postsContainer.innerHTML = `<p class="text-center text-danger">Gagal memuat feed: ${error.message}</p>`;
    }
}

// --- FUNGSI MERAKIT HTML UNTUK POSTINGAN ---
function createPostHTML(post, currentUserId) {
    const timeAgo = getTimeAgo(post.created_at); // Fungsi getTimeAgo lama Anda masih bisa dipakai!
    const isOwnPost = (post.user_id == currentUserId);
    
    // Cek avatar jika tidak punya foto profil
    const profileImg = (post.profile_img && post.profile_img !== 'default.jpg') 
                        ? `backend/uploads/${post.profile_img}` 
                        : generateAvatar(post.user_name); // generateAvatar lama Anda masih valid!

    // Cek apakah ada gambar yang diposting
    const postImageHTML = post.image_url 
                        ? `<img src="uploads/${post.image_url}" alt="Post image" class="post-image mt-3" style="width: 100%; border-radius: 12px;">` 
                        : '';

    // 1. TAMBAHAN BARU: Tampilkan komentar lama dari database
    let commentsHTML = '';
    if (post.comments && post.comments.length > 0) {
        post.comments.forEach(comment => {
            commentsHTML += `
                <div class="comment-item mb-2 border-bottom pb-1">
                    <small><strong>${comment.user_name}</strong>: ${comment.content}</small>
                </div>`;
        });
    }

    // 2. TAMBAHAN BARU: Cek status like untuk menentukan warna hati dari database
    const isLiked = post.is_liked > 0;
    const likedClass = isLiked ? 'active' : '';
    const heartIcon = isLiked ? 'bi-heart-fill text-danger' : 'bi-heart';

    return `
            <div class="post-card mb-4" data-post-id="${post.post_id}">
            <div class="d-flex justify-content-between mb-3">
            
                <div class="d-flex align-items-center gap-2" onclick="viewUserProfile(${post.user_id})" style="cursor: pointer;" title="Lihat profil ${post.user_name}">
                    <img src="${profileImg}" alt="${post.user_name}" class="rounded-circle" style="width: 45px; height: 45px; object-fit: cover;">
                    <div>
                        <h6 class="mb-0 fw-bold text-dark hover-underline">${post.user_name}</h6>
                        <small class="text-muted" style="font-size: 0.8rem;">${timeAgo}</small>
                    </div>
                </div>
                ${isOwnPost ? `
                <button class="btn btn-sm btn-light rounded-circle text-danger" onclick="deletePost(${post.post_id})" title="Hapus">
                    <i class="bi bi-trash"></i>
                </button>
                ` : ''}
            </div>
            
            <div class="post-content">
                <p class="mb-0">${escapeHtml(post.content)}</p>
            </div>
            
            ${postImageHTML}
            
            <hr class="text-muted opacity-25 my-3">
            
            <div class="d-flex gap-2 mb-3">
                <button class="btn btn-light rounded-pill flex-fill fw-semibold text-muted like-btn ${likedClass}" 
                        onclick="handleLike(${post.post_id}, this)">
                    <i class="bi ${heartIcon} me-1"></i> 
                    <span class="like-count">${post.total_likes || 0}</span> Suka
                </button>
                <button class="btn btn-light rounded-pill flex-fill fw-semibold text-muted" 
                        onclick="toggleCommentSection(${post.post_id}, this)"
                    <i class="bi bi-chat me-1"></i> Komentar
                </button>
            </div>

            <div id="comment-section-${post.post_id}" class="comment-section" style="display: none;">
                <hr class="text-muted opacity-25">
                <div id="comments-list-${post.post_id}" class="comments-list mb-3 px-2">
                    ${commentsHTML}
                </div>
                
                <form onsubmit="handleComment(event, ${post.post_id})" class="px-2">
                    <div class="input-group input-group-sm">
                        <input type="text" class="form-control rounded-start-pill bg-light border-0 shadow-none" placeholder="Tulis komentar...">
                        <button class="btn btn-primary rounded-end-pill px-3" type="submit">
                            <i class="bi bi-send"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// --- FUNGSI HAPUS POSTINGAN ---
async function deletePost(postId) {
    if (!confirm("Apakah Anda yakin ingin menghapus postingan ini?")) {
        return; 
    }

    const formData = new FormData();
    formData.append('post_id', postId);

    try {
        const response = await fetch('backend/delete_post.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.status === 'success') {
            // 1. MENCARI KARTU POSTINGAN DI LAYAR
            // Kita cari elemen div yang punya data-post-id sesuai dengan yang dihapus
            const postCard = document.querySelector(`.post-card[data-post-id="${postId}"]`);
            
            if (postCard) {
                // 2. HAPUS DARI LAYAR SECARA INSTAN!
                // Tambahkan sedikit animasi transisi (opsional agar terlihat mulus)
                postCard.style.transition = "opacity 0.3s ease";
                postCard.style.opacity = "0";
                
                setTimeout(() => {
                    postCard.remove(); // Menghapus HTML-nya dari layar browser
                }, 300);
            }

            // 3. Update angka di profil (jika ada)
            if (typeof loadProfile === 'function') loadProfile(); 
            
        } else {
            alert("Gagal: " + result.message);
        }
    } catch (error) {
        console.error("Gagal menghapus postingan:", error);
    }
}


function previewPostImage(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('imagePreview');
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; border-radius: 12px;">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
}



// Profile Functions
function loadProfile() {
    // 1. Ambil data dari window.currentUser
    const user = window.currentUser; 

    // 2. CEK VALIDASI AWAL (Mencegah Error Fatal)
    if (!user) {
        console.warn("Data user belum siap atau belum login.");
        return;
    }

    // 3. SINKRONISASI GAMBAR (Wajib Paling Atas)
    // Gunakan parameter unik ?t agar browser tidak mengambil cache gambar lama
    if (user.profile_img) {
        updateAllProfileImages(user.profile_img);
        
        // Update juga elemen profileImg spesifik (untuk halaman profile.html)
        const profileImg = document.getElementById('profileImg');
        if (profileImg) {
            profileImg.src = `backend/uploads/${user.profile_img}?t=${new Date().getTime()}`;
        }
    }

    // 4. SINKRONISASI IDENTITAS (Nama, Bio, Email)
    // Menggunakan try-catch agar jika satu elemen ID tidak ada, script tidak mati
    try {
        const nameElements = document.querySelectorAll('#profileName, .sidebar-username');
        nameElements.forEach(el => el.textContent = user.name || 'User');

        const bioElements = document.querySelectorAll('#profileBio, #profileBioSmall');
        bioElements.forEach(el => el.textContent = user.bio || 'Belum ada bio');

        const emailEl = document.getElementById('profileEmail');
        if (emailEl) emailEl.textContent = user.email || '';
    } catch (e) {
        console.error("Error updating text identity:", e);
    }

    // 5. SINKRONISASI STATISTIK (Postingan, Pengikut, Mengikuti)
    // Menggunakan innerText dan memastikan angka tampil (default ke 0)
    try {
        const pCount = document.getElementById('totalPosts');
        const fCount = document.getElementById('totalFollowers');
        const gCount = document.getElementById('totalFollowing');

        // Pastikan variabel dari backend (total_posts dll) ada, jika tidak default ke 0
        if (pCount) pCount.innerText = user.total_posts !== undefined ? user.total_posts : 0;
        if (fCount) fCount.innerText = user.total_followers !== undefined ? user.total_followers : 0;
        if (gCount) gCount.innerText = user.total_following !== undefined ? user.total_following : 0;
        
        console.log("Statistik berhasil diupdate:", {
            posts: user.total_posts,
            followers: user.total_followers,
            following: user.total_following
        });
    } catch (e) {
        console.error("Error updating statistics:", e);
    }

    // 6. LOAD POSTINGAN USER
    if (typeof loadUserPosts === 'function' && user.id) {
        loadUserPosts(user.id);
    }
}



async function loadUserPosts(userId) {
    const container = document.getElementById('profilePostsContainer');
    if (!container) return;

    try {
        // Ini yang akan memicu kemunculan get_feed.php di Network tab
        const response = await fetch('backend/get_feed.php');
        const result = await response.json();

        if (result.status === 'success') {
            // Filter agar hanya menampilkan post milik kita sendiri
            const myPosts = result.posts.filter(p => p.user_id == userId);
            
            if (myPosts.length === 0) {
                container.innerHTML = '<p class="text-center text-muted my-4">Belum ada postingan.</p>';
                return;
            }
            // Tampilkan postingan
            container.innerHTML = myPosts.map(post => createPostHTML(post, userId)).join('');
        }
    } catch (error) {
        console.error("Gagal memuat feed profil:", error);
    }
}

function openEditProfileModal() {
    const user = window.currentUser;
    if (!user) {
        alert("Sesi berakhir, silakan login kembali.");
        return;
    }

    // Isi data ke dalam form modal
    const editName = document.getElementById('editName');
    const editBio = document.getElementById('editBio');

    if (editName) editName.value = user.name || '';
    if (editBio) editBio.value = user.bio || '';

    // Munculkan Modal Bootstrap
    const modalElement = document.getElementById('editProfileModal');
    if (modalElement) {
        const modalInstance = new bootstrap.Modal(modalElement);
        modalInstance.show();
    } else {
        console.error("Elemen editProfileModal tidak ditemukan di HTML!");
    }
}

async function handleEditProfile(e) {
    e.preventDefault();
    
    // 1. Ambil elemen input (Pastikan ID 'editName' dan 'editBio' ada di HTML modal Anda)
    const nameInput = document.getElementById('editName');
    const bioInput = document.getElementById('editBio');

    if (!nameInput) {
        console.error("Input editName tidak ditemukan!");
        return;
    }

    // 2. Bungkus data (Gunakan nama kunci 'name' dan 'bio')
    const formData = new FormData();
    formData.append('name', nameInput.value);
    formData.append('bio', bioInput.value);

    try {
        const response = await fetch('backend/edit_profile.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.status === 'success') {
            // 3. Update Variabel Global (Agar UI tidak kembali ke 'User')
            window.currentUser.name = nameInput.value;
            window.currentUser.bio = bioInput.value;
            
            // 4. Tutup Modal
            const modalEl = document.getElementById('editProfileModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();
            
            // 5. Render Ulang UI
            loadProfile(); 
            alert("Profil berhasil diperbarui!");
        } else {
            alert("Gagal: " + result.message);
        }
    } catch (error) {
        console.error("Error saat update:", error);
    }
}

// Fungsi untuk Handle Like
async function handleLike(postId, btnElement) {
    const formData = new FormData();
    formData.append('post_id', postId);

    try {
        // Panggil file backend yang sudah Anda buat sebelumnya
        const response = await fetch('./backend/toggle_like.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();

        if (result.status === 'liked' || result.status === 'unliked') {
            // 1. Cari elemen angka di dalam tombol yang diklik
            const likeCountSpan = btnElement.querySelector('.like-count');
            // 2. Cari elemen ikon di dalam tombol
            const icon = btnElement.querySelector('i');

            // 3. Update jumlah angka dari response server
            likeCountSpan.innerText = result.total_likes;

            // 4. Ubah warna dan bentuk ikon
            if (result.status === 'liked') {
                btnElement.classList.add('active'); // Menambah class active untuk CSS
                icon.classList.replace('bi-heart', 'bi-heart-fill'); // Jadi hati penuh
                icon.classList.add('text-danger'); // Jadi warna merah (Bootstrap class)
            } else {
                btnElement.classList.remove('active');
                icon.classList.replace('bi-heart-fill', 'bi-heart'); // Jadi hati kosong
                icon.classList.remove('text-danger');
            }
        }
    } catch (e) {
        console.error("Gagal melakukan like:", e);
    }
}

async function handleComment(event, postId) {
    event.preventDefault(); // Mencegah halaman refresh

    const form = event.target;
    const input = form.querySelector('input');
    const content = input.value;
    const commentList = document.getElementById(`comments-list-${postId}`);

    if (!content) return;

    const formData = new FormData();
    formData.append('post_id', postId);
    formData.append('content', content);

    try {
        const response = await fetch('./backend/add_comment.php', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.status === 'success') {
            // Buat tampilan komentar baru secara instan
            const newComment = document.createElement('div');
            newComment.className = 'comment-item mb-2';
            newComment.innerHTML = `
                <small><strong>${result.user_name}</strong>: ${result.content}</small>
            `;

            // Masukkan ke daftar komentar paling bawah
            commentList.appendChild(newComment);
            
            // Kosongkan input kembali
            input.value = '';
        } else {
            alert(result.message);
        }
    } catch (e) {
        console.error("Gagal mengirim komentar:", e);
    }
}

function toggleCommentSection(postId, buttonElement) {
    // Jika tombol mengirimkan identitas dirinya (this)
    if (buttonElement) {
        // Cari wadah postingan (post-card) tempat tombol ini berada
        const postCard = buttonElement.closest('.post-card');
        // Cari bagian komentar KHUSUS di dalam postingan ini saja
        const commentSection = postCard.querySelector('.comment-section');
        
        if (commentSection) {
            if (commentSection.style.display === 'none' || commentSection.style.display === '') {
                commentSection.style.display = 'block';
            } else {
                commentSection.style.display = 'none';
            }
        }
    } 
    // Fallback keamanan (jika sewaktu-waktu cara lama masih terpanggil)
    else {
        const commentSection = document.getElementById(`comment-section-${postId}`);
        if (commentSection) {
            if (commentSection.style.display === 'none' || commentSection.style.display === '') {
                commentSection.style.display = 'block';
            } else {
                commentSection.style.display = 'none';
            }
        }
    }
}

async function uploadProfilePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Validasi ukuran (opsional, misal max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file terlalu besar! Maksimal 2MB.");
        return;
    }

    // 2. Siapkan data untuk dikirim ke server
    const formData = new FormData();
    formData.append('profile_img', file);

    try {
        // Tampilkan loading jika perlu
        showNotification('Sedang mengunggah... ⏳', 'info');

        const response = await fetch('backend/edit_profile.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.status === 'success') {
            // 3. Update data lokal jika server berhasil menyimpan
            // result.new_image harus dikirim balik dari PHP
            if (window.currentUser) {
                window.currentUser.profile_img = result.new_image;
            }

            showNotification('Foto profil berhasil diperbarui! 📷', 'success');
            
            // 4. Render ulang UI
            loadProfile(); 
            // Fungsi ini memastikan foto di header & halaman profil berubah
            if (typeof updateAllProfileImages === 'function') {
                updateAllProfileImages(result.new_image);
            }
        } else {
            alert('Gagal unggah: ' + result.message);
        }
    } catch (error) {
        console.error("Error Upload:", error);
        alert('Terjadi kesalahan koneksi ke server.');
    }
}

// --- FUNGSI MELIHAT PROFIL USER ---
// --- 1. FUNGSI KLIK PROFIL USER ---
function viewUserProfile(userId) {
    // 1. Jika klik profil sendiri, buka halaman profil pribadi
    if (window.currentUser && window.currentUser.id == userId) {
        showPage('profile'); 
        return;
    }

    // 2. Muat data profil Dila
    loadOtherProfile(userId);
    
    // 3. Gunakan nama awal tanpa kata 'Page' 
    showPage('otherProfile'); 

    // 4. JAMINAN MUTU (Force Display)
    // Jika showPage masih gagal menampilkan, kita paksa halamannya muncul menggunakan cara yang baru saja Anda buktikan berhasil di Console!
    setTimeout(() => {
        // Sembunyikan Feed secara paksa
        const feedPage = document.getElementById('feedPage');
        if (feedPage) feedPage.classList.remove('active');
        if (feedPage) feedPage.style.display = 'none';

        // Tampilkan halaman Profil Orang Lain secara paksa
        const otherProfile = document.getElementById('otherProfilePage');
        if (otherProfile) otherProfile.classList.add('active');
        if (otherProfile) otherProfile.style.display = 'block';
    }, 50); // delay super cepat 50 milidetik agar data selesai dimuat dulu
}

// --- 2. FUNGSI MEMUAT DATA DARI SERVER ---
// --- 2. FUNGSI MEMUAT DATA DARI SERVER ---
async function loadOtherProfile(userId) {
    const headerContainer = document.getElementById('otherProfileHeader');
    const postsContainer = document.getElementById('otherProfilePosts');
    
    // Tampilkan efek loading
    headerContainer.innerHTML = `
        <div class="spinner-border text-primary my-3" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>`;
    postsContainer.innerHTML = '';

    try {
        // Memanggil file PHP yang baru kita buat
        const response = await fetch(`backend/get_other_profile.php?id=${userId}`);
        const result = await response.json();

        if (result.status === 'success') {
            const user = result.user;
            const isFollowing = result.is_following;
            const currentUserId = result.current_user_id;

            // Render Foto Profil
            const profileImg = (user.profile_img && user.profile_img !== 'default.jpg') 
                                ? `backend/uploads/${user.profile_img}` 
                                : generateAvatar(user.name);

            // Render Tombol Follow
            const btnClass = isFollowing ? 'btn-outline-secondary' : 'btn-primary';
            const btnText = isFollowing ? 'Diikuti' : 'Ikuti';
            const icon = isFollowing ? 'bi-check2' : 'bi-person-plus-fill';

            // Masukkan Info User ke Header
            headerContainer.innerHTML = `
                <img src="${profileImg}" class="rounded-circle mb-3 shadow-sm border" style="width: 100px; height: 100px; object-fit: cover;">
                <h4 class="fw-bold mb-1">${user.name}</h4>
                <button class="btn btn-sm rounded-pill px-4 mt-3 ${btnClass}" onclick="toggleFollow('${user.id}', this)" style="font-weight:600;">
                    <i class="bi ${icon} me-1"></i> ${btnText}
                </button>
            `;

            // Masukkan Daftar Postingan
            if (result.posts.length === 0) {
                postsContainer.innerHTML = `
                    <div class="text-center p-5 bg-white rounded shadow-sm">
                        <i class="bi bi-camera text-muted" style="font-size: 2rem;"></i>
                        <p class="text-muted mt-2 mb-0">Belum ada postingan.</p>
                    </div>`;
            } else {
                // Kita gunakan fungsi rakitan HTML yang sama dengan Feed
                postsContainer.innerHTML = result.posts.map(post => createPostHTML(post, currentUserId)).join('');
            }

        } else {
            headerContainer.innerHTML = `<p class="text-danger">Gagal memuat profil: ${result.message}</p>`;
        }
    } catch (error) {
        console.error("Gagal load profil orang lain:", error);
        headerContainer.innerHTML = '<p class="text-danger">Terjadi kesalahan koneksi.</p>';
    }
}

function updateAllProfileImages(newImageName) {
    if (!newImageName) return;

    // Menambahkan variabel acak di ujung URL agar browser WAJIB download ulang
    const uniqueUrl = `backend/uploads/${newImageName}?v=${Math.random()}`;
    
    // Ambil semua elemen gambar, termasuk ID spesifik Anda
    const targets = [
        '#profileImg', 
        '#createPostProfileIm', 
        '.profile-img-small', 
        '.nav-profile-img'
    ];
    
    const profileImages = document.querySelectorAll(targets.join(', '));
    
    profileImages.forEach(img => {
        img.src = uniqueUrl;
        console.log("Updating image to:", uniqueUrl); // Cek di console (F12) apakah ini jalan
    });
}


// --- FUNGSI UPLOAD POSTINGAN ---
document.getElementById('createPostForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formElement = document.getElementById('createPostForm');
    const formData = new FormData();
    
    // Ambil data manual karena kita menggunakan struktur div khusus di HTML modal Anda
    formData.append('content', document.getElementById('postContent').value);
    
    const imageFile = document.getElementById('postImage').files[0];
    if(imageFile) {
        formData.append('image', imageFile);
    }

    try {
        const response = await fetch('backend/create_post.php', {
            method: 'POST',
            body: formData
        });

        const resultText = await response.text();

        if(resultText.trim() === 'sukses') {
            alert('Postingan berhasil dibagikan! 🎉');
            
            // Tutup modal Bootstrap
            const modalElement = document.getElementById('createPostModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
            
            // Reset form
            formElement.reset();
            document.getElementById('imagePreview').innerHTML = ''; // Hapus preview gambar
            
            // TODO: Nanti panggil fungsi loadPosts() di sini untuk merefresh feed
        } else {
            alert(resultText); // Tampilkan pesan error
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan koneksi.');
    }
});

// --- FUNGSI FOLLOW/UNFOLLOW ---
async function toggleFollow(followingId, buttonElement) {
    const formData = new FormData();
    formData.append('following_id', followingId);

    try {
        const response = await fetch('backend/follow.php', {
            method: 'POST',
            body: formData
        });

        const resultText = await response.text();

        if(resultText.trim() === 'followed') {
            buttonElement.innerText = 'Mengikuti';
            buttonElement.classList.replace('btn-primary', 'btn-outline-secondary');
        } else if (resultText.trim() === 'unfollowed') {
            buttonElement.innerText = 'Ikuti';
            buttonElement.classList.replace('btn-outline-secondary', 'btn-primary');
        } else {
            alert(resultText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function generateAvatar(name) {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substr(0, 2);
    const colors = ['#5AADCE', '#7FC3DC', '#4A9FC4', '#B8E0ED'];
    const bgColor = colors[Math.floor(Math.random() * colors.length)];
    
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 100, 100);
    
    return canvas.toDataURL();
}

function getTimeAgo(dateString) {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return 'Baru saja';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' mnt';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' jam';
    return Math.floor(seconds / 86400) + ' hr';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed; top: 100px; right: 20px;
        background: ${type === 'success' ? '#4A9FC4' : type === 'error' ? '#e74c3c' : '#5AADCE'};
        color: white; padding: 1rem 1.5rem; border-radius: 12px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2); z-index: 9999;
        animation: slideInRight 0.3s ease; max-width: 300px; font-weight: 500;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Fitur Search Modal Navbar
async function performNavbarSearch() {
    const keyword = document.getElementById('navbarSearchInput').value.toLowerCase();
    const container = document.getElementById('searchResultsContainer');
    if (!container) return;

    if (!keyword) {
        container.innerHTML = '<p class="text-muted small text-center my-4">Ketikkan nama di atas untuk mulai mencari teman.</p>';
        return;
    }

    try {
        const response = await fetch('backend/get_users.php');
        const result = await response.json();

        if (result.status === 'success') {
            const suggested = result.users.filter(u => u.name.toLowerCase().includes(keyword));
            const following = result.following || [];

            if (suggested.length === 0) {
                container.innerHTML = '<p class="text-muted small text-center my-4">Yah, pengguna tidak ditemukan.</p>';
                return;
            }

            container.innerHTML = suggested.map(user => {
                const isFollowing = following.includes(user.id) || following.includes(String(user.id));
                const btnClass = isFollowing ? 'btn-outline-secondary' : 'btn-primary';
                const btnText = isFollowing ? 'Diikuti' : 'Ikuti';
                const icon = isFollowing ? 'bi-check2' : 'bi-person-plus-fill';
                
                const profileImg = (user.profile_img && user.profile_img !== 'default.jpg') 
                                    ? `backend/uploads/${user.profile_img}` 
                                    : generateAvatar(user.name);
                
                return `
                    <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                        <div class="d-flex align-items-center gap-2" onclick="viewUserProfile(${user.id})" style="cursor: pointer;" title="Lihat profil ${user.name}">
                            <img src="${profileImg}" class="rounded-circle shadow-sm" width="45" height="45" style="object-fit:cover;">
                            <div>
                                <h6 class="mb-0 fw-bold" style="font-size:0.95rem;">${user.name}</h6>
                            </div>
                        </div>
                        <button class="btn btn-sm rounded-pill px-3 ${btnClass}" onclick="toggleFollow('${user.id}', this)" style="font-size:0.8rem; font-weight:600;">
                            <i class="bi ${icon} me-1"></i> ${btnText}
                        </button>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error("Gagal mencari teman:", error);
    }
}