document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const buildTypeSelect = document.getElementById('buildType');
  const gappsOptionSelect = document.getElementById('gappsOption');
  const cleanBuildSelect = document.getElementById('cleanBuild');
  const cpuJobsSelect = document.getElementById('cpuJobs');

  const craveQueueCode = document.getElementById('craveQueueCode');
  const detachedQueueCode = document.getElementById('detachedQueueCode');
  const scriptCode = document.getElementById('scriptCode');
  const monitorCode = document.getElementById('monitorCode');

  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const copyButtons = document.querySelectorAll('.copy-btn');
  const fileChips = document.querySelectorAll('.file-chip');
  const fileContent = document.getElementById('fileContent');
  const activeFileName = document.getElementById('activeFileName');
  const refreshBtn = document.getElementById('refreshBtn');

  const DEVICE = 'udon';
  const PRODUCT = 'evolution_udon';
  const BRANCH = 'arena/01a042ed-oneplus11r-device-trees';

  // Function to generate dynamic commands
  function updateCommands() {
    const buildType = buildTypeSelect.value;
    const withGms = gappsOptionSelect.value;
    const clean = cleanBuildSelect.value === 'yes';
    const cpu = cpuJobsSelect.value;

    const cleanFlag = clean ? ' --clean' : '';
    const cleanCmd = clean ? 'make clean && ' : 'make installclean && ';

    // Payload executed inside Crave 64GB queue build node
    const payload = `rm -rf .repo/local_manifests && \\
mkdir -p .repo/local_manifests && \\
repo init -u https://github.com/Evolution-X/manifest -b cnb --git-lfs --depth=1 && \\
curl -sL https://raw.githubusercontent.com/Gokulgethu/oneplus11r-device-trees/${BRANCH}/evolution_udon.xml -o .repo/local_manifests/evolution_udon.xml && \\
if [ -f /opt/crave/resync.sh ]; then /opt/crave/resync.sh; else /usr/bin/resync; fi && \\
[ -d device/oneplus/udon ] && [ ! -d device/oneplus/CPH2487 ] && ln -sf udon device/oneplus/CPH2487; \\
export BUILD_USERNAME=Gokulgethu && \\
export BUILD_HOSTNAME=crave && \\
export EVO_BUILD_TYPE=Unofficial && \\
export WITH_GMS=${withGms} && \\
source build/envsetup.sh && \\
lunch ${PRODUCT}-${buildType} && \\
${cleanCmd}mka bacon -j${cpu}`;

    // 1. Crave Queue Command (attached)
    if (craveQueueCode) {
      craveQueueCode.textContent = `crave -c crave.conf run --no-patch${cleanFlag} -- "${payload}"`;
    }

    // 2. Crave Detached Queue Command
    if (detachedQueueCode) {
      detachedQueueCode.textContent = `crave -c crave.conf run --detached --no-patch${cleanFlag} -- "${payload}"`;
    }

    // 3. Queue build script
    if (scriptCode) {
      const cleanOpt = clean ? ' --clean' : '';
      scriptCode.textContent = `# Run the queue runner with crave.conf authentication:
./queue_build.sh${cleanOpt}

# Or detached mode (submits to queue and disconnects):
./queue_build.sh --detached${cleanOpt}`;
    }

    // 4. Monitoring & Artifact download
    if (monitorCode) {
      monitorCode.textContent = `# 1. Check queue position and running builds:
crave -c crave.conf list

# 2. View live build log output:
crave -c crave.conf getlog

# 3. Pull flashable ROM package when finished:
crave -c crave.conf pull "out/target/product/${DEVICE}/EvolutionX-17.0-*.zip"

# 4. Pull partition images:
crave -c crave.conf pull out/target/product/${DEVICE}/boot.img
crave -c crave.conf pull out/target/product/${DEVICE}/recovery.img
crave -c crave.conf pull out/target/product/${DEVICE}/vendor_boot.img
crave -c crave.conf pull out/target/product/${DEVICE}/dtbo.img`;
    }
  }

  // Listeners for command inputs
  buildTypeSelect.addEventListener('change', updateCommands);
  gappsOptionSelect.addEventListener('change', updateCommands);
  cleanBuildSelect.addEventListener('change', updateCommands);
  cpuJobsSelect.addEventListener('change', updateCommands);

  // Tabs switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetTab = btn.getAttribute('data-tab');
      const content = document.getElementById(targetTab);
      if (content) content.classList.add('active');
    });
  });

  // Copy buttons
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetId = btn.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      try {
        await navigator.clipboard.writeText(targetEl.textContent);
        const originalText = btn.textContent;
        btn.textContent = '✅ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    });
  });

  // File loading
  async function loadFile(fileName) {
    activeFileName.textContent = fileName;
    fileContent.textContent = `Loading ${fileName}...`;

    try {
      const res = await fetch(`/api/file?name=${encodeURIComponent(fileName)}`);
      const data = await res.json();
      if (data.content) {
        fileContent.textContent = data.content;
      } else {
        fileContent.textContent = `// Error loading file: ${data.error || 'Unknown error'}`;
      }
    } catch (err) {
      fileContent.textContent = `// Error connecting to backend: ${err.message}`;
    }
  }

  fileChips.forEach(chip => {
    chip.addEventListener('click', () => {
      fileChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const file = chip.getAttribute('data-file');
      loadFile(file);
    });
  });

  // Refresh status
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.textContent = '⌛ Checking...';
    try {
      const res = await fetch('/api/info');
      const data = await res.json();
      console.log('Build Info:', data);
      refreshBtn.textContent = '✅ Updated';
      setTimeout(() => { refreshBtn.textContent = '🔄 Refresh Status'; }, 2000);
    } catch (err) {
      refreshBtn.textContent = '⚠️ Error';
      setTimeout(() => { refreshBtn.textContent = '🔄 Refresh Status'; }, 2000);
    }
  });

  // Initial calls
  updateCommands();
  loadFile('evolution_udon.mk');
});
