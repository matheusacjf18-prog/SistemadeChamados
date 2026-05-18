-- ==============================================================================
-- RM TECHNOLOGIES - ARQUIVO DE BASE INICIAL (SEED) - VERSÃO SQLITE
-- ==============================================================================

-- 1. Tabela de Grupos
CREATE TABLE IF NOT EXISTS `groups` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `group_name` TEXT NOT NULL UNIQUE,
  `display_name` TEXT NOT NULL,
  `description` TEXT DEFAULT NULL
);

INSERT OR IGNORE INTO `groups` (`id`, `group_name`, `display_name`, `description`) VALUES
(1, 'master_admin', 'Administrador Master', NULL),
(2, 'admin', 'Administrador', NULL),
(3, 'client', 'Cliente', NULL);

-- 2. Tabela de Usuários
CREATE TABLE IF NOT EXISTS `users` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `username` TEXT NOT NULL UNIQUE,
  `password` TEXT NOT NULL,
  `full_name` TEXT NOT NULL,
  `email` TEXT NOT NULL UNIQUE,
  `telephone` TEXT DEFAULT NULL,
  `recovery_code` TEXT DEFAULT NULL,
  `recovery_expires` DATETIME DEFAULT NULL,
  `password_changed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO `users` (`id`, `username`, `password`, `full_name`, `email`, `telephone`, `created_at`, `password_changed_at`) VALUES
(1, 'rangel', '1234', 'Rafael Rangel', 'rafaeljf200@gmail.com', '32991816412', '2026-02-22 06:59:06', '2026-03-22 04:59:47'),
(2, 'teste', 'teste', 'Teste', 'teste@teste.com', NULL, '2026-02-22 20:55:58', '2026-02-23 03:49:08'),
(3, 'castro', '021223', 'Matheus Castro', 'matheusacjf18@gmail.com', '', '2026-03-19 14:29:10', '2026-03-19 14:29:10');

-- 3. Permissões: User Groups
CREATE TABLE IF NOT EXISTS `user_groups` (
  `user_id` INTEGER NOT NULL,
  `group_id` INTEGER NOT NULL,
  PRIMARY KEY (`user_id`,`group_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE
);

INSERT OR IGNORE INTO `user_groups` (`user_id`, `group_id`) VALUES
(1, 1), 
(1, 2), 
(3, 2), 
(2, 3);

-- 4. Tabela de Tickets
CREATE TABLE IF NOT EXISTS `tickets` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `author_username` TEXT NOT NULL,
  `subject` TEXT NOT NULL,
  `description` TEXT NOT NULL,
  `status` TEXT DEFAULT 'aberto' CHECK (`status` IN ('aberto','atendimento','concluido')),
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`author_username`) REFERENCES `users` (`username`) ON DELETE CASCADE
);

INSERT OR IGNORE INTO `tickets` (`id`, `author_username`, `subject`, `description`, `status`, `created_at`) VALUES
(5, 'rangel', 'Teste', 'Teste da nova atualização', 'aberto', '2026-02-23 01:35:49'),
(6, 'rangel', 'Teste 22/02', 'Descrição do teste', 'aberto', '2026-02-23 02:25:32'),
(7, 'rangel', 'Teste', '12345678', 'aberto', '2026-02-23 05:13:22'),
(8, 'rangel', 'Teste 23/02', 'Teste massa', 'aberto', '2026-02-23 05:24:45'),
(9, 'rangel', 'Teste de banco', '123124', 'aberto', '2026-02-23 05:33:28'),
(10, 'rangel', 'Teste bis', 'Lacta', 'aberto', '2026-02-23 15:44:47'),
(11, 'rangel', 'teste', 'teste 2203', 'aberto', '2026-03-22 03:48:27'),
(12, 'rangel', 'teste 0159', 'desc teste 0159', 'aberto', '2026-03-22 04:59:35');

-- 5. Tabela de Garantias
CREATE TABLE IF NOT EXISTS `assets_garantia` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `user_id` INTEGER NOT NULL,
  `equipamento` TEXT NOT NULL,
  `data_entrega` DATE NOT NULL,
  `meses_garantia` INTEGER DEFAULT 12,
  `status_servico` TEXT DEFAULT 'ativo' CHECK (`status_servico` IN ('ativo','manutencao','finalizado')),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- 6. Tabela de Etiquetas QRCodes
CREATE TABLE IF NOT EXISTS `generated_qrcodes` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `label` TEXT NOT NULL,
  `target_url` TEXT NOT NULL,
  `qr_image_base64` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabela de Logs de Auditoria
CREATE TABLE IF NOT EXISTS `system_logs` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `data_hora` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `usuario_executor` TEXT NOT NULL,
  `acao` TEXT NOT NULL,
  `detalhes` TEXT DEFAULT NULL
);