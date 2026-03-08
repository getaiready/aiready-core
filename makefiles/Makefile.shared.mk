ifndef AIREADY_SHARED_MK
AIREADY_SHARED_MK := 1
unexport AIREADY_SHARED_MK

###############################################################################
# Makefile.shared: Common macros, variables, and environment config for all spokes
###############################################################################

# Load environment variables from .env if present (not committed)
ifneq (,$(wildcard .env))
	include .env
	export
endif
# Also load landing-specific env if present
ifneq (,$(wildcard landing/.env))
	include landing/.env
	export
endif

# Dynamics discover all packages in packages/ directory
# Exclude skills (skills.sh distribution only, not npm)
ALL_SPOKES := $(filter-out skills, $(notdir $(wildcard packages/*)))

# Resolve root directory relative to this file
ROOT_DIR ?= $(abspath $(dir $(lastword $(MAKEFILE_LIST)))/..)

# Project directory definitions
LANDING_DIR := $(ROOT_DIR)/landing
PLATFORM_DIR := $(ROOT_DIR)/platform
EXTENSION_DIR := $(ROOT_DIR)/vscode-extension
CLAWMART_DIR := $(ROOT_DIR)/clawmart

# Three-phase release strategy (matches release-all workflow)
# Landing site is EXCLUDED from release-all (different release cadence)
# Skills is EXCLUDED - it's distributed via skills.sh, not npm
CORE_SPOKE := core
CLI_SPOKE := cli
MIDDLE_SPOKES := $(filter-out core cli, $(sort $(ALL_SPOKES)))

# Legacy: Sequential release order (deprecated - use phase variables above)
RELEASE_ORDER := core $(MIDDLE_SPOKES) cli

# ⚠️  CRITICAL WORKFLOW RULE:
# After publishing ANY spoke separately, ALWAYS republish CLI:
#   make release-one SPOKE=<any-spoke> TYPE=patch
#   make release-one SPOKE=cli TYPE=patch  # ← REQUIRED!
# Why? CLI imports all spokes dynamically. Mismatch causes runtime errors.
# Note: release-all handles this automatically by releasing CLI last.

.ONESHELL:

###############################################################################
# AWS Configuration - CRITICAL: Verify before any deployment!
###############################################################################
# ⚠️  ALWAYS verify AWS account before deploying:
#     aws sts get-caller-identity
#     aws configure list
# ⚠️  Default profile: 'aiready' - MUST match your AWS credentials
# Override with: export AWS_PROFILE=your-profile
AWS_PROFILE ?= aiready
AWS_REGION ?= ap-southeast-2
EXPECTED_AWS_ACCOUNT_ID := 316759592139

# Verify AWS account and profile matches expectations
.PHONY: verify-aws-account
verify-aws-account:
	@CURRENT_ACCOUNT=$$(aws sts get-caller-identity --query Account --output text --profile $(AWS_PROFILE) 2>/dev/null); \
	if [ "$$CURRENT_ACCOUNT" != "$(EXPECTED_AWS_ACCOUNT_ID)" ]; then \
		printf '$(RED)[ERROR] Invalid AWS Account detected!$(RESET_COLOR)\n'; \
		printf '  Expected: $(EXPECTED_AWS_ACCOUNT_ID) (aiready)\n'; \
		printf '  Found   : '"$$CURRENT_ACCOUNT"'\n'; \
		printf '  Profile : $(AWS_PROFILE)\n'; \
		exit 1; \
	fi
	@printf '$(GREEN)✓ AWS Account verified: $(AWS_PROFILE) ($(EXPECTED_AWS_ACCOUNT_ID))$(RESET_COLOR)\n'

# Notifications (defaults for solo founder)
SES_TO_EMAIL ?= caopengau@gmail.com

# Cloudflare DNS (optional; do not commit secrets)
CLOUDFLARE_API_TOKEN ?=
CLOUDFLARE_ACCOUNT_ID ?=
CLOUDFLARE_ZONE_ID ?=
DOMAIN_NAME ?= getaiready.dev

# Color definitions
RED        := $(shell printf '\033[0;31m')    # color: #FF0000
GREEN      := $(shell printf '\033[0;32m')    # color: #00FF00
YELLOW     := $(shell printf '\033[0;33m')    # color: #FFFF00
BLUE       := $(shell printf '\033[0;34m')    # color: #0000FF
LIGHTBLUE  := $(shell printf '\033[1;34m')    # color: #1E90FF
CYAN       := $(shell printf '\033[0;36m')    # color: #00FFFF
MAGENTA    := $(shell printf '\033[0;35m')    # color: #FF00FF
WHITE      := $(shell printf '\033[0;37m')    # color: #FFFFFF
NC         := $(shell printf '\033[0m')       # alias for RESET_COLOR (no color)

BOLD       := $(shell printf '\033[1m')       # style: bold
UNDERLINE  := $(shell printf '\033[4m')       # style: underline

# Background colors
BG_RED     := $(shell printf '\033[41m')      # bg: #FF0000
BG_GREEN   := $(shell printf '\033[42m')      # bg: #00FF00
BG_YELLOW  := $(shell printf '\033[43m')      # bg: #FFFF00
BG_BLUE    := $(shell printf '\033[44m')      # bg: #0000FF

RESET_COLOR         := $(shell printf '\033[0m')    # reset (same as NC)
# Literal backslash-escaped clear sequence. Expand at runtime with printf '%b'.
INDENT_CLEAR       := \r\033[K

# Logging macros
# Usage: $(call log_info,Message)
define log_info
	printf '$(INDENT_CLEAR)[INFO] %s$(RESET_COLOR)\n' "$(1)"
endef

define log_success
	printf '$(GREEN)$(INDENT_CLEAR)[SUCCESS] %s$(RESET_COLOR)\n' "$(1)"
endef

define log_warning
	printf '$(YELLOW)$(INDENT_CLEAR)[WARNING] %s$(RESET_COLOR)\n' "$(1)"
endef

define log_error
	printf '$(RED)$(INDENT_CLEAR)[ERROR] %s$(RESET_COLOR)\n' "$(1)"
endef

define log_step
	printf '$(LIGHTBLUE)$(INDENT_CLEAR)[STEP] %s$(RESET_COLOR)\n' "$(1)"
endef

define log_debug
	printf '$(MAGENTA)$(INDENT_CLEAR)[DEBUG] %s$(RESET_COLOR)\n' "$(1)"
endef

# separator: print separator line with optional color
# Usage: $(call separator,COLOR)
define separator
	printf '%s$(BOLD)$(INDENT_CLEAR)============================================$(RESET_COLOR)\n' "$(1)"
endef

# Controlled parallelism: detect CPU count and only pass -j to sub-makes
# when the parent make was not already started with -j (avoids jobserver warnings).
PARALLELISM ?= $(shell sysctl -n hw.ncpu 2>/dev/null || nproc 2>/dev/null || echo 4)
ifneq ($(filter -j% -j,$(MAKEFLAGS)),)
	MAKE_PARALLEL :=
else
	MAKE_PARALLEL := -j$(PARALLELISM)
endif

# Default pnpm silent flag (can be overridden by caller)
SILENT_PNPM ?= --silent

# Purpose: Time the execution of a target command
# Usage: $(call track_time,command,label)
define track_time
	start=$$(date +%s); \
	eval $(1); \
	status=$$?; \
	end=$$(date +%s); \
	elapsed=$$((end - start)); \
	if [ $$status -eq 0 ]; then \
		printf '$(GREEN)\r\033[K✅ %s completed in %ss$(RESET_COLOR)\n' "$(2)" "$$elapsed"; \
	else \
		printf '$(RED)\r\033[K❌ %s failed after %ss$(RESET_COLOR)\n' "$(2)" "$$elapsed"; \
	fi; \
	exit $$status
endef

# Usage: $(call is_ci_environment)
define is_ci_environment
	$(shell [ -n "$$CI" ] || [ -n "$$GITHUB_ACTIONS" ] || [ -n "$$GITLAB_CI" ] || [ -n "$$CIRCLECI" ] || [ -n "$$JENKINS_URL" ] && echo "true" || echo "false")
endef

# Default silent targets for multi-line recipes that produce controlled output
.SILENT: test test-core test-pattern-detect

# kill_port
# usage: $(call kill_port_without_prompt,8888)
define kill_port
	@lsof -ti :$(1) >/dev/null 2>&1 && lsof -ti :$(1) | xargs kill || true
	@$(call log_success,Port $(1) is now free)
endef

endif # AIREADY_SHARED_MK
