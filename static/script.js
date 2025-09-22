$(function () {
    // Theme Toggle Functionality
    const themeToggle = $('#themeToggle');
    const body = $('body');
    const themeIcon = themeToggle.find('i');
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Theme toggle event
    themeToggle.click(function() {
        const currentTheme = body.attr('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    function setTheme(theme) {
        if (theme === 'dark') {
            body.attr('data-theme', 'dark');
            themeIcon.removeClass('fa-moon').addClass('fa-sun');
        } else {
            body.removeAttr('data-theme');
            themeIcon.removeClass('fa-sun').addClass('fa-moon');
        }
    }
    
    // Mobile Menu Toggle
    $('#mobileMenuBtn').click(function() {
        $('.nav-links').toggleClass('active');
        const icon = $(this).find('i');
        icon.toggleClass('fa-bars fa-times');
    });
    
    // Smooth scrolling for navigation links
    $('.nav-links a[href^="#"]').click(function(e) {
        e.preventDefault();
        const target = $($(this).attr('href'));
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 80
            }, 500);
        }
        
        // Close mobile menu if open
        $('.nav-links').removeClass('active');
        $('#mobileMenuBtn i').removeClass('fa-times').addClass('fa-bars');
    });
    
    // URL Input validation
    $('#url').on('input', function() {
        const input = $(this);
        const value = input.val().trim();
        
        if (value === '') {
            input.removeClass('valid invalid');
            return;
        }
        
        // Simple URL validation
        try {
            new URL(value);
            input.removeClass('invalid').addClass('valid');
        } catch {
            input.removeClass('valid').addClass('invalid');
        }
    });
    
    // URL Shortening functionality
    $('#submit').click(function () {
        const urlInput = $('#url');
        const submitBtn = $(this);
        const resultSection = $('#shortcode');
        const url = urlInput.val().trim();
        
        // Validation
        if (!url) {
            showNotification('Please enter a URL', 'error');
            urlInput.focus();
            return;
        }
        
        // Basic URL format validation
        try {
            new URL(url);
        } catch {
            showNotification('Please enter a valid URL', 'error');
            urlInput.focus();
            return;
        }
        
        // Show loading state
        submitBtn.addClass('loading');
        submitBtn.prop('disabled', true);
        
        // Make API request
        $.post('/api/v1/shorten', {
            url: url
        })
        .done(function (data) {
            // Hide loading state
            submitBtn.removeClass('loading').prop('disabled', false);
            
            // Create the short URL
            const shortUrl = window.location.origin + '/' + data;
            
            // Display result
            displayResult(shortUrl, url);
            showNotification('URL shortened successfully!', 'success');
            
            // Clear input
            urlInput.val('').removeClass('valid invalid');
        })
        .fail(function (xhr, status, error) {
            // Hide loading state
            submitBtn.removeClass('loading').prop('disabled', false);
            
            // Show error message
            console.error('Error shortening URL:', error);
            showNotification('Failed to shorten URL. Please try again.', 'error');
        });
    });
    
    // Handle Enter key in input field
    $('#url').keypress(function(e) {
        if (e.which === 13) { // Enter key
            e.preventDefault();
            $('#submit').click();
        }
    });
    
    // Display result function
    function displayResult(shortUrl, originalUrl) {
        const resultHtml = `
            <div class="result-header">
                <i class="fas fa-check-circle"></i>
                <span>Your shortened URL is ready!</span>
            </div>
            <div class="result-item">
                <div class="result-url">${shortUrl}</div>
                <button class="copy-btn" onclick="copyToClipboard('${shortUrl}', this)">
                    <i class="fas fa-copy"></i>
                    <span>Copy</span>
                </button>
            </div>
            <div class="result-item">
                <div class="result-original">Original: ${originalUrl}</div>
            </div>
        `;
        
        $('#shortcode').html(resultHtml).addClass('show');
        
        // Scroll to result
        $('html, body').animate({
            scrollTop: $('#shortcode').offset().top - 100
        }, 500);
    }
    
    // Copy to clipboard function
    window.copyToClipboard = function(text, button) {
        const btn = $(button);
        const originalContent = btn.html();
        
        // Use modern clipboard API if available
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(function() {
                btn.addClass('copied').html('<i class="fas fa-check"></i><span>Copied!</span>');
                setTimeout(function() {
                    btn.removeClass('copied').html(originalContent);
                }, 2000);
            }).catch(function(err) {
                console.error('Failed to copy: ', err);
                fallbackCopy(text, btn, originalContent);
            });
        } else {
            // Fallback for older browsers
            fallbackCopy(text, btn, originalContent);
        }
    };
    
    // Fallback copy function
    function fallbackCopy(text, btn, originalContent) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            btn.addClass('copied').html('<i class="fas fa-check"></i><span>Copied!</span>');
            setTimeout(function() {
                btn.removeClass('copied').html(originalContent);
            }, 2000);
        } catch (err) {
            console.error('Fallback copy failed: ', err);
            showNotification('Failed to copy URL', 'error');
        }
        
        document.body.removeChild(textArea);
    }
    
    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        $('.notification').remove();
        
        const notification = $(`
            <div class="notification notification-${type}">
                <i class="fas ${getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `);
        
        $('body').append(notification);
        
        // Show notification
        setTimeout(() => notification.addClass('show'), 100);
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            notification.removeClass('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Manual close
        notification.find('.notification-close').click(function() {
            notification.removeClass('show');
            setTimeout(() => notification.remove(), 300);
        });
    }
    
    function getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }
    
    // Animate stats on scroll
    function animateStats() {
        const stats = $('.stat-number');
        stats.each(function() {
            const $this = $(this);
            const target = parseInt($this.text().replace(/[^\d]/g, ''));
            const isVisible = isElementInViewport($this[0]);
            
            if (isVisible && !$this.hasClass('animated')) {
                $this.addClass('animated');
                animateValue($this[0], 0, target, 2000);
            }
        });
    }
    
    function animateValue(element, start, end, duration) {
        const range = end - start;
        const startTime = performance.now();
        const suffix = element.textContent.replace(/[\d,]/g, '');
        
        function updateValue(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (range * progress));
            
            element.textContent = current.toLocaleString() + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        }
        
        requestAnimationFrame(updateValue);
    }
    
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    // Scroll event for animations
    $(window).scroll(function() {
        animateStats();
    });
    
    // Initial check for stats animation
    $(document).ready(function() {
        animateStats();
    });
    
    // Feature cards hover effect
    $('.feature-card').hover(
        function() {
            $(this).find('i').addClass('fa-bounce');
        },
        function() {
            $(this).find('i').removeClass('fa-bounce');
        }
    );
});