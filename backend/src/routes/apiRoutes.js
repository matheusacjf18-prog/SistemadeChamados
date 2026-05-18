const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const ticketController = require('../controllers/ticketController');
const userController = require('../controllers/userController');
const qrController = require('../controllers/qrController');
const assetController = require('../controllers/assetController');

router.post('/login', authController.login);
router.post('/solicitar-codigo', authController.solicitarCodigo);
router.post('/validar-codigo', authController.validarCodigo);
router.post('/resetar-senha', authController.resetarSenha);

router.post('/enviar-chamado', ticketController.enviarChamado);
router.get('/chamados', ticketController.listarChamadosCliente);
router.get('/admin/chamados', ticketController.listarTodosChamados);
router.put('/admin/atualizar-status', ticketController.atualizarStatus);

router.get('/usuario/:username', userController.obterPerfil);
router.put('/atualizar-perfil', userController.atualizarPerfil);
router.post('/admin/criar-usuario', userController.criarUsuarioAdmin);
router.get('/admin/usuarios', userController.listarUsuariosAdmin);
router.put('/admin/editar-usuario', userController.editarUsuarioAdmin);
router.delete('/admin/excluir-usuario/:id/:admin_logado', userController.excluirUsuario);
router.get('/admin/logs/:admin_logado', userController.listarLogs);

router.post('/admin/gerar-qr', qrController.gerarEGravar);
router.get('/admin/lista-qrcodes', qrController.listarHistorico);
router.get('/admin/qr-image/:id', qrController.obterImagem);
router.get('/cliente/meus-ativos/:userId', assetController.getMeusAtivos);

module.exports = router;