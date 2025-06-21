document.addEventListener('DOMContentLoaded', () => {
    const rollButton = document.getElementById('rollButton');
    const numDiceInput = document.getElementById('numDice');
    const numSidesInput = document.getElementById('numSides');
    const diceContainer = document.getElementById('diceContainer');
    const totalResultSpan = document.getElementById('totalResult');

    const DICE_SIZE = 100;

    // Daftar warna menarik untuk dadu
    const DICE_COLORS = [
        { bg: '#FF5733', dot: '#FFFFFF' }, // Oranye terang
        { bg: '#33FF57', dot: '#282c34' }, // Hijau terang
        { bg: '#3357FF', dot: '#FFFFFF' }, // Biru terang
        { bg: '#FF33DA', dot: '#282c34' }, // Ungu pink
        { bg: '#FFDB33', dot: '#282c34' }, // Kuning keemasan
        { bg: '#61dafb', dot: '#282c34' }, // Warna default (biru langit)
        { bg: '#f0f0f0', dot: '#282c34' }  // Warna putih default
    ];

    const DEFAULT_DICE_COLOR = { bg: '#f0f0f0', dot: '#282c34' }; // Warna dadu saat tidak berputar

    // Fungsi untuk membuat elemen dadu 3D lengkap
    function createDice3DElement() {
        const diceCube = document.createElement('div');
        diceCube.classList.add('dice-cube');

        // Set warna default saat pertama kali dibuat
        diceCube.style.setProperty('--dice-bg-color', DEFAULT_DICE_COLOR.bg);
        diceCube.style.setProperty('--dice-dot-color', DEFAULT_DICE_COLOR.dot);

        // Tambahkan 6 sisi ke kubus
        for (let i = 1; i <= 6; i++) {
            const face = document.createElement('div');
            face.classList.add('cube-face', `face-${i}`);
            face.textContent = i; // Tampilkan angka pada sisi
            diceCube.appendChild(face);
        }
        return diceCube;
    }

    // Fungsi untuk menampilkan dadu 3D berdasarkan jumlah input
    function renderDiceElements(count) {
        diceContainer.innerHTML = ''; // Kosongkan container
        for (let i = 0; i < count; i++) {
            diceContainer.appendChild(createDice3DElement());
        }
    }

    renderDiceElements(parseInt(numDiceInput.value));

    numDiceInput.addEventListener('change', () => {
        const count = parseInt(numDiceInput.value);
        if (count > 0) {
            renderDiceElements(count);
        } else {
            numDiceInput.value = 1;
            renderDiceElements(1);
        }
    });

    function getRotationForNumber(number) {
        switch (number) {
            case 1: return { x: 0, y: 0, z: 0 };
            case 2: return { x: 0, y: 90, z: 0 };
            case 3: return { x: -90, y: 0, z: 0 };
            case 4: return { x: 90, y: 0, z: 0 };
            case 5: return { x: 0, y: -90, z: 0 };
            case 6: return { x: 0, y: 180, z: 0 };
            default: return { x: 0, y: 0, z: 0 };
        }
    }

    rollButton.addEventListener('click', async () => {
        const numDice = parseInt(numDiceInput.value);
        const numSides = 6; // Tetap 6 sisi untuk animasi 3D ini

        const allDiceCubes = document.querySelectorAll('.dice-cube');

        // Reset rotasi, terapkan warna acak, dan mulai animasi
        allDiceCubes.forEach(dice => {
            dice.style.transform = '';
            dice.style.transition = 'none'; // Pastikan tidak ada transisi lama
            dice.classList.remove('rolling');
            void dice.offsetWidth; // Memaksa reflow

            // Pilih warna acak untuk dadu ini
            const randomColor = DICE_COLORS[Math.floor(Math.random() * DICE_COLORS.length)];
            dice.style.setProperty('--dice-bg-color', randomColor.bg);
            dice.style.setProperty('--dice-dot-color', randomColor.dot);

            dice.classList.add('rolling');
        });

        const animationDuration = 1500;

        setTimeout(async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/roll', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ num_dice: numDice, num_sides: numSides }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Terjadi kesalahan pada server.');
                }

                const data = await response.json();
                const rolls = data.rolls;
                const total = data.total;

                // Terapkan hasil rotasi, hentikan animasi, dan kembalikan warna
                allDiceCubes.forEach((dice, index) => {
                    dice.classList.remove('rolling');
                    if (rolls[index] !== undefined) {
                        const result = rolls[index];
                        const targetRotation = getRotationForNumber(result);

                        const randomRotX = Math.floor(Math.random() * 5 + 3) * 360;
                        const randomRotY = Math.floor(Math.random() * 5 + 3) * 360;
                        const randomRotZ = Math.floor(Math.random() * 5 + 3) * 360;

                        dice.style.transform = `
                            rotateX(${targetRotation.x + randomRotX}deg)
                            rotateY(${targetRotation.y + randomRotY}deg)
                            rotateZ(${targetRotation.z + randomRotZ}deg)
                        `;
                        // Transisi transform sudah di CSS

                        // Kembalikan ke warna default setelah animasi selesai
                        dice.style.setProperty('--dice-bg-color', DEFAULT_DICE_COLOR.bg);
                        dice.style.setProperty('--dice-dot-color', DEFAULT_DICE_COLOR.dot);
                    }
                });
                totalResultSpan.textContent = total;

            } catch (error) {
                console.error('Error:', error);
                alert('Gagal melempar dadu: ' + error.message + '\nPastikan backend (app.py) berjalan.');
                allDiceCubes.forEach(dice => {
                    dice.classList.remove('rolling');
                    dice.style.transform = '';
                    dice.style.transition = 'none';
                    // Pastikan warna kembali normal jika terjadi error
                    dice.style.setProperty('--dice-bg-color', DEFAULT_DICE_COLOR.bg);
                    dice.style.setProperty('--dice-dot-color', DEFAULT_DICE_COLOR.dot);
                });
                totalResultSpan.textContent = 'Error';
            }
        }, animationDuration);
    });
});