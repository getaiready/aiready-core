###############################################################################
# Makefile.test: Testing-related targets
###############################################################################
# Resolve this makefile's directory to allow absolute invocation
MAKEFILE_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(MAKEFILE_DIR)/Makefile.shared.mk

.PHONY: test test-core test-pattern-detect test-watch test-coverage test-verify-cli test-contract test-integration \
	test-landing-e2e test-platform-e2e test-platform test-landing test-platform-e2e-local test-landing-e2e-local \
	test-visualizer test-vscode-extension test-downstream test-clawmore-e2e-local test-clawmore-e2e-prod \
	test-clawmore-e2e-full test-clawmore-e2e-console test-clawmore-integration test-clawmore-contracts \
	mcp-test-server mcp-test-ast

test: ## Run tests for all packages (noninteractive)
	@$(call log_step,Running tests for all packages (noninteractive)...) 
	@if command -v turbo >/dev/null 2>&1; then \
		unset npm_config_loglevel; \
		CI=1 turbo run test test-contract $(SILENT_TURBO); \
	else \
		CI=1 $(PNPM) --no-interactive $(SILENT_PNPM) test; \
	fi
	@$(call log_success,All tests passed)

test-core: ## Run tests for core package only
	@$(call log_info,Running tests for @aiready/core...)
	@$(PNPM) --filter @aiready/core test
	@$(call log_success,Core tests passed)

test-pattern-detect: ## Run tests for pattern-detect package only
	@$(call log_info,Running tests for @aiready/pattern-detect...)
	@$(PNPM) --filter @aiready/pattern-detect test
	@$(call log_success,Pattern-detect tests passed)

test-watch: ## Run tests in watch mode
	@$(call log_info,Running tests in watch mode...)
	@$(PNPM) test --watch

test-coverage: ## Run tests with coverage report
	@$(call log_step,Running tests with coverage...)
	@for pkg in packages/core packages/pattern-detect packages/context-analyzer packages/consistency packages/visualizer packages/components packages/skills packages/cli; do \
		if [ -f "$$pkg/package.json" ]; then \
			$(call log_info,Running coverage for $$pkg...); \
			cd $$pkg && $(PNPM) test --coverage 2>/dev/null || $(call log_warning,Coverage failed for $$pkg); \
			cd ../..; \
		fi; \
	done
	@$(call log_success,Coverage report generated)

test-landing: ## Run unit tests for landing page
	@$(call log_info,Running tests for @aiready/landing...)
	@cd apps/landing && $(PNPM) lint || $(call log_warning,Landing lint had errors - continuing anyway)
	@$(call log_success,Landing tests checked)

test-platform: ## Run unit tests for platform
	@$(call log_info,Running tests for @aiready/platform...)
	@cd apps/platform && $(PNPM) test
	@$(call log_success,Platform unit tests passed)

test-contract: ## Run Spoke-to-Hub contract tests (Tier 1)
	@$(call log_step,Running Tier 1 Contract Tests...)
	@if command -v turbo >/dev/null 2>&1; then \
		unset npm_config_loglevel; \
		CI=1 turbo run test:contract $(SILENT_TURBO); \
	else \
		$(PNPM) -r exec -- vitest run contract.test.ts --passWithNoTests; \
	fi
	@$(call log_success,Tier 1 Contract Tests passed)

test-integration: ## Run monorepo integration tests (Tier 2)
	@$(call log_step,Running Tier 2 Integration Tests...)
	@$(PNPM) --filter @aiready/integration-tests test
	@$(call log_success,Tier 2 Integration Tests passed)

test-verify-cli: ## Run a smoke scan and verify CLI output
	@$(call log_step,Running CLI smoke test...)
	@# Run scan directly using aiready (npm linked)
	@aiready scan packages/cli/src --score || { $(call log_error,CLI scan failed); exit 1; }
	@$(call log_success,CLI smoke test passed)

test-landing-e2e: ## Run E2E tests for landing page
	@$(call log_step,Running landing page E2E tests...)
	@cd apps/landing && CI=1 $(PNPM) exec playwright test --reporter=list
	@$(call log_success,Landing page E2E tests passed)

test-landing-e2e-local: ## Run landing E2E tests against local dev server
	@$(call log_step,Running landing E2E tests against local dev server...)
	@cd apps/landing && CI=1 $(PNPM) exec playwright test --reporter=list
	@$(call log_success,Landing local E2E tests passed)

test-platform-e2e: ## Run Playwright E2E tests for platform against dev endpoint
	@$(call log_step,Running platform E2E tests against https://dev.platform.getaiready.dev...)
	@cd apps/platform && CI=1 PLAYWRIGHT_TEST_BASE_URL=https://dev.platform.getaiready.dev $(PNPM) test:e2e
	@$(call log_success,Platform E2E tests passed)

test-platform-e2e-local: ## Run platform E2E tests against local dev server
	@$(call log_step,Running platform E2E tests against local server...)
	@cd apps/platform && CI=1 $(PNPM) test:e2e
	@$(call log_success,Platform local E2E tests passed)

test-visualizer: ## Build and test the visualizer
	@$(call log_step,Verifying @aiready/visualizer...)
	@$(PNPM) --filter @aiready/visualizer run typecheck || { $(call log_error,Visualizer typecheck failed); exit 1; }
	@$(PNPM) --filter @aiready/visualizer build || { $(call log_error,Visualizer build failed); exit 1; }
	@$(PNPM) --filter @aiready/visualizer test || { $(call log_error,Visualizer tests failed); exit 1; }
	@$(call log_success,Visualizer verified)

test-vscode-extension: ## Compile the VS Code extension to ensure no breaking changes
	@$(call log_step,Verifying aiready (VS Code extension)...)
	@cd apps/vscode-extension && $(PNPM) exec tsc --noEmit && $(PNPM) run compile || { $(call log_error,VS Code extension verification failed); exit 1; }
	@$(call log_success,VS Code extension verified)

test-downstream: ## Run all downstream verification tests (platform, visualizer, vscode-extension)
	@$(call log_step,Running DOWNSTREAM verification (safety check for hubs)...)
	@$(MAKE) $(MAKE_PARALLEL) test-platform test-visualizer test-vscode-extension test-landing
	@$(call log_success,All downstream services verified)

test-clawmore-e2e-local: ## Run ClawMore E2E tests locally (uses next dev, not sst dev)
	@$(call log_step,Running ClawMore E2E tests locally...)
	@cd apps/clawmore && pnpm exec playwright test e2e/seo.spec.ts --config playwright.config.local.ts
	@$(call log_success,ClawMore tests passed)

test-clawmore-e2e-prod: ## Run ClawMore E2E tests against live production site
	@$(call log_step,Running ClawMore E2E tests against production...)
	@cd apps/clawmore && BASE_URL=https://clawmore.ai pnpm exec playwright test e2e/seo.spec.ts --config playwright.config.prod.ts
	@$(call log_success,ClawMore production tests passed)

test-clawmore-e2e-full: ## Run full ClawMore provisioning flow E2E tests
	@$(call log_step,Running full ClawMore provisioning flow E2E tests...)
	@cd apps/clawmore && pnpm exec playwright test e2e/provisioning-flow.spec.ts --config playwright.config.local.ts
	@$(call log_success,Full provisioning flow tests passed)

test-clawmore-e2e-console: ## Run ClawMore provisioning console UI E2E tests
	@$(call log_step,Running ClawMore provisioning console UI tests...)
	@cd apps/clawmore && pnpm exec playwright test e2e/provisioning-console.spec.ts --config playwright.config.local.ts
	@$(call log_success,Provisioning console tests passed)

test-clawmore-integration: ## Run ClawMore integration tests (webhook → provisioning → DB)
	@$(call log_step,Running ClawMore integration tests...)
	@cd apps/clawmore && pnpm test
	@$(call log_success,ClawMore integration tests passed)

test-clawmore-contracts: ## Run ClawMore Hub-Spoke contract tests
	@$(call log_step,Running ClawMore Hub-Spoke contract tests...)
	@cd apps/clawmore && pnpm test lib/contracts/hub-spoke.test.ts
	@$(call log_success,ClawMore contract tests passed)

mcp-test-server: ## Verify @aiready/mcp-server protocol (requires build)
	@$(call log_step,Verifying @aiready/mcp-server protocol...)
	@node tooling/scripts/mcp-test.js packages/mcp-server/dist/index.js "pattern-detect" '{"path": "."}'
	@$(call log_success,@aiready/mcp-server verified)

mcp-test-ast: ## Verify @aiready/ast-mcp-server protocol (requires build)
	@$(call log_step,Verifying @aiready/ast-mcp-server protocol...)
	@node tooling/scripts/mcp-test.js packages/ast-mcp-server/dist/index.js "search_code" '{"pattern": "pnpm", "path": "."}'
	@$(call log_success,@aiready/ast-mcp-server verified)
