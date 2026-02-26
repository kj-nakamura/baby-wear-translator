package main

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestSetupRouter_CORS(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := SetupRouter()

	// Test case: Valid Origin
	t.Run("Valid Origin", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodOptions, "/milestones", nil)
		req.Header.Set("Origin", "http://localhost:3000")
		req.Header.Set("Access-Control-Request-Method", "GET")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusNoContent && w.Code != http.StatusOK {
			t.Errorf("expected OK or NoContent for CORS preflight, got %d", w.Code)
		}

		allowOrigin := w.Header().Get("Access-Control-Allow-Origin")
		if allowOrigin != "http://localhost:3000" {
			t.Errorf("expected Access-Control-Allow-Origin: http://localhost:3000, got %s", allowOrigin)
		}
	})

	// Test case: Invalid Origin
	t.Run("Invalid Origin", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodOptions, "/milestones", nil)
		req.Header.Set("Origin", "http://malicious-site.com")
		req.Header.Set("Access-Control-Request-Method", "GET")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		allowOrigin := w.Header().Get("Access-Control-Allow-Origin")
		if allowOrigin == "http://malicious-site.com" {
			t.Errorf("expected Access-Control-Allow-Origin to NOT be http://malicious-site.com")
		}
	})
}
