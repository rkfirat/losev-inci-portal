NAME = losev-inci-portal
COMPOSE = docker-compose

# Default command (make) -> up
all: up

# Build and start all services in Docker in detached mode
up:
	@echo "🟢 Starting $(NAME) services..."
	$(COMPOSE) up -d --build

# Stop the running services
down:
	@echo "🔴 Stopping $(NAME) services..."
	$(COMPOSE) down

# Stop containers and remove project database/cache volumes (persistent data)
clean:
	@echo "🧹 Cleaning up containers and volumes..."
	$(COMPOSE) down -v

# Perform clean + completely remove compiled Docker images and local node_modules
fclean: clean
	@echo "🔥 Deep cleaning images and local dependencies (node_modules)..."
	$(COMPOSE) down -v --rmi all
	rm -rf backend/node_modules backend/dist
	rm -rf mobile/node_modules
	@echo "✨ Clean complete."

# Setup from scratch (Full Clean -> Up)
re: fclean all

# Tail logs of all services live (Ctrl+C to exit)
logs:
	$(COMPOSE) logs -f

# Seed the backend database with fresh test data
seed:
	@echo "🌱 Seeding database..."
	$(COMPOSE) exec backend sh -c "npx prisma db seed"

# Run backend tests (23 integration tests)
test-backend:
	@echo "🧪 Running backend tests..."
	cd backend && npm test

# Run backend tests with coverage report
test-backend-coverage:
	@echo "📊 Backend coverage..."
	cd backend && npm run test:coverage

# Run mobile tests (4 tests)
test-mobile:
	@echo "🧪 Running mobile tests..."
	cd mobile && npm test

# Run all tests (backend + mobile)
test: test-backend test-mobile

.PHONY: all up down clean fclean re logs seed test test-backend test-backend-coverage test-mobile
