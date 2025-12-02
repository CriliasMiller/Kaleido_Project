window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality
function toggleMoreWorks() {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        button.classList.add('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.more-works-container');
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (container && !container.contains(event.target)) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Close dropdown on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('moreWorksDropdown');
        const button = document.querySelector('.more-works-btn');
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button.querySelector('.copy-text');
    
    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function() {
            // Success feedback
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel video');
    
    if (carouselVideos.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Video is in view, play it
                video.play().catch(e => {
                    // Autoplay failed, probably due to browser policy
                    console.log('Autoplay prevented:', e);
                });
            } else {
                // Video is out of view, pause it
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the video is visible
    });
    
    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

$(document).ready(function() {
    // Check for click events on the navbar burger icon

    var options = {
		slidesToScroll: 1,
		slidesToShow: 1,
		loop: true,
		infinite: true,
		autoplay: true,
		autoplaySpeed: 5000,
    }

	// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    bulmaSlider.attach();

    // Setup video autoplay for carousel
    setupVideoCarouselAutoplay();

    // Setup video lazy loading for better performance
    setupVideoLazyLoading();

    // Setup video pause on scroll for resource saving
    setupVideoPauseOnScroll();
})

// 视频懒加载功能 - 大幅提升页面加载性能
function setupVideoLazyLoading() {
    const videos = document.querySelectorAll('.video-item video');

    if (videos.length === 0) return;

    // 先设置preload="none"，不预先加载
    videos.forEach(video => {
        video.preload = 'none';
        video.setAttribute('data-lazy', 'true');

        // 为每个视频添加加载占位符
        const videoContainer = video.closest('.video-item');
        if (videoContainer && !videoContainer.querySelector('.video-loading-placeholder')) {
            const placeholder = document.createElement('div');
            placeholder.className = 'video-loading-placeholder';
            placeholder.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> 加载视频...</div>';
            placeholder.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: #f8fafc;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 12px;
                z-index: 1;
                font-family: 'Inter', sans-serif;
            `;

            const spinner = placeholder.querySelector('.loading-spinner');
            spinner.style.cssText = `
                color: #2563eb;
                font-size: 1.2rem;
                font-weight: 600;
            `;

            videoContainer.style.position = 'relative';
            videoContainer.insertBefore(placeholder, videoContainer.firstChild);
        }
    });

    // 创建Intersection Observer来检测视频是否进入视口
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(async entry => {
            const video = entry.target;
            const videoContainer = video.closest('.video-item');
            const placeholder = videoContainer?.querySelector('.video-loading-placeholder');

            if (entry.isIntersecting && video.getAttribute('data-lazy') === 'true') {
                // 视频进入视口，开始加载
                try {
                    // 显示加载状态
                    if (placeholder) {
                        placeholder.style.display = 'flex';
                    }

                    // 设置视频源并加载
                    video.preload = 'metadata';
                    video.setAttribute('data-lazy', 'false');

                    // 当视频元数据加载完成时
                    const onVideoLoaded = () => {
                        if (placeholder) {
                            placeholder.style.display = 'none';
                        }
                        // 尝试自动播放
                        video.play().catch(e => {
                            console.log('Autoplay prevented:', e);
                        });
                    };

                    if (video.readyState >= 1) {
                        onVideoLoaded();
                    } else {
                        video.addEventListener('loadeddata', onVideoLoaded, { once: true });
                    }

                    // 强制加载视频
                    video.load();

                } catch (error) {
                    console.error('Video loading error:', error);
                    if (placeholder) {
                        placeholder.innerHTML = '<div style="color: #ef4444; padding: 1rem;">视频加载失败</div>';
                    }
                }

                // 停止观察已加载的视频
                videoObserver.unobserve(video);
            }
        });
    }, {
        rootMargin: '50px', // 提前50px开始加载
        threshold: 0.1
    });

    // 开始观察所有视频
    videos.forEach(video => {
        videoObserver.observe(video);
    });
}

// 暂停视口外的视频以节省资源
function setupVideoPauseOnScroll() {
    const videos = document.querySelectorAll('.video-item video');

    if (videos.length === 0) return;

    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;

            if (entry.isIntersecting) {
                // 视频在视口中，继续播放
                if (video.paused && video.readyState >= 2) {
                    video.play().catch(() => {});
                }
            } else {
                // 视频离开视口，暂停播放
                if (!video.paused) {
                    video.pause();
                }
            }
        });
    }, {
        threshold: 0.2 // 当20%的视频离开视口时暂停
    });

    videos.forEach(video => {
        videoObserver.observe(video);
    });
}
