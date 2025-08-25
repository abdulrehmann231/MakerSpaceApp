'use client'

import { useEffect, useState } from 'react'
import Loader from './Loader'

export default function AppWrapper({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show loader when component mounts (for every page)
    setIsLoading(true);
    
    // Hide loader after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [children]); // Re-run when children change (page navigation)

  useEffect(() => {
    // Initialize jQuery functionality when component mounts
    const initializeJQuery = () => {
      if (typeof window !== 'undefined' && window.$) {
        // Sidebar functionality
        $('.menu-left').off('click').on('click', function () {
          $('body').addClass('menu-left-open');
          $('body .wrapper').append('<div class="backdrop"></div>');
          $('.backdrop').off('click').on('click', function () {
            $('body').removeClass('menu-left-open');
            $('.backdrop').fadeOut().remove();
          });
        });

        $('.sidebar-close').off('click').on('click', function () {
          $('body').removeClass('menu-left-open');
          $('.backdrop').fadeOut().remove();
        });

        // Search functionality
        $('.searchbtn').off('click').on('click', function () {
          $('.searchcontrol').addClass('active');
        });
        
        $('.close-search').off('click').on('click', function () {
          $('.searchcontrol').removeClass('active');
        });

        // Theme functionality
        if ($.type($.cookie("theme-color")) != 'undefined' && $.cookie("theme-color") != '') {
          $('body').removeClass('color-theme-blue');
          $('body').addClass($.cookie("theme-color"));
        }
        
        $('.theme-color .btn').off('click').on('click', function () {
          $('body').removeClass('color-theme-blue');
          $('body').removeClass($.cookie("theme-color"));
          $.cookie("theme-color", $(this).attr('data-theme'), {
            expires: 1
          });
          $('body').addClass($.cookie("theme-color"));
        });

        // Theme layout functionality
        if ($.type($.cookie("theme-color-layout")) != 'undefined' && $.cookie("theme-color-layout") != '') {
          $('body').removeClass('theme-light');
          $('body').addClass($.cookie("theme-color-layout"));
        }
        
        $('.theme-layout .btn').off('click').on('click', function () {
          $('body').removeClass('theme-light');
          $('body').removeClass($.cookie("theme-color-layout"));
          $.cookie("theme-color-layout", $(this).attr('data-layout'), {
            expires: 1
          });
          $('body').addClass($.cookie("theme-color-layout"));
        });

        if ($.type($.cookie("theme-color-layout")) != 'theme-light' && $.cookie("theme-color-layout") != 'theme-light') {
          $('#theme-dark').prop('checked', true);
        }
        
        $('#theme-dark').off('change').on('change', function () {
          if ($(this).is(':checked') === true) {
            $('body').removeClass('theme-light');
            $('body').removeClass($.cookie("theme-color-layout"));
            $.cookie("theme-color-layout", 'theme-dark', {
              expires: 1
            });
            $('body').addClass($.cookie("theme-color-layout"));
          } else {
            $('body').removeClass('theme-dark');
            $('body').removeClass($.cookie("theme-color-layout"));
            $.cookie("theme-color-layout", 'theme-light', {
              expires: 1
            });
            $('body').addClass($.cookie("theme-color-layout"));
          }
        });

        // Page content height for sticky footer
        $('.content-sticky-footer').css({
          'padding-bottom': ($('.footer-wrapper').height() + 35)
        });
        $('.footer-wrapper').css('margin-top', -($('.footer-wrapper').height() + 20));

        // Page inside iframe just for demo app
        if (self !== top) {
          $('body').addClass('max-demo-frame')
        }

        // Hide loader when page is fully loaded (jQuery fallback)
        $(window).off('load').on('load', function () {
          $('.loader').css("display","none");
        });

        // Also hide loader after a short delay as fallback
        setTimeout(() => {
          $('.loader').css("display","none");
        }, 1500);
      }
    };

    // Wait for jQuery to be available
    const waitForJQuery = () => {
      if (typeof window !== 'undefined' && window.$) {
        initializeJQuery();
      } else {
        setTimeout(waitForJQuery, 100);
      }
    };

    waitForJQuery();

    // Also initialize when DOM changes (for dynamic content)
    const observer = new MutationObserver(() => {
      if (typeof window !== 'undefined' && window.$) {
        initializeJQuery();
      }
    });

    if (typeof window !== 'undefined' && document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="App">
      {isLoading && <Loader />}
      <div className="wrapper">
        {children}
      </div>
    </div>
  );
}
