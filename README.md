# VIDEOKE — Sistema de Reservas

Site responsivo para locação de equipamentos de karaokê, desenvolvido com HTML, CSS e JavaScript, integrado ao Supabase para consulta de disponibilidade e gerenciamento de reservas.

## Funcionalidades

- Site público com valor de **R$ 300 por diária**.
- Apresentação do equipamento, do kit e das imagens.
- Formulário para consultar a disponibilidade de datas.
- Registro de solicitações de reserva no Supabase.
- Reservas registradas com status `pendente`.
- Painel administrativo para o locador acessar e gerenciar as solicitações.
- Opções para confirmar ou cancelar reservas.
- Liberação de datas após o cancelamento.
- Contato pelo WhatsApp.
- Layout adaptável para computadores, tablets e celulares.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- Supabase (banco de dados e autenticação)
- GitHub Pages (hospedagem estática, se ativada)

## Estrutura do projeto

- `index.html` — página pública do site.
- `admin.html` — painel administrativo.
- `css/style.css` — estilos e responsividade.
- `js/config.js` — configuração da conexão com o Supabase.
- `js/script.js` — consulta de disponibilidade, formulário e solicitações de reserva.
- `js/admin.js` — autenticação e gerenciamento de reservas.
- `supabase-schema.sql` — estrutura e políticas do banco de dados.
- `assets/` — imagens utilizadas no site.

## Configuração do Supabase

O projeto utiliza um banco de dados Supabase para armazenar as reservas e consultar a disponibilidade.

O arquivo `js/config.js` deve conter a URL do projeto e a chave pública (`publishable` ou `anon`) correspondente:

```js
window.VIDEOKE_CONFIG = {
  supabaseUrl: "SUA_PROJECT_URL",
  supabaseAnonKey: "SUA_CHAVE_PUBLICA"
};
```

Se o Supabase já estiver configurado no projeto, mantenha os valores atuais. **Nunca coloque a chave secreta `service_role` no código do navegador ou em um repositório público.**

O banco precisa ter as tabelas, funções e políticas de acesso necessárias, conforme definido e configurado no projeto Supabase.

## Acesso administrativo

O painel está disponível em `admin.html`.

O acesso depende de um usuário autenticado e autorizado no Supabase. Somente usuários cadastrados na lista de administradores devem poder gerenciar as reservas.

Não compartilhe credenciais administrativas e não habilite permissões públicas que permitam consultar ou alterar dados privados das reservas.

## Como funciona uma reserva

1. O cliente informa os dados solicitados e a data desejada.
2. O site consulta a disponibilidade no Supabase.
3. Se a data estiver disponível, o cliente pode solicitar a reserva.
4. A solicitação é registrada com status `pendente`.
5. O locador acessa o painel administrativo e confirma ou cancela a solicitação.
6. O cancelamento libera a data conforme as regras de disponibilidade configuradas no banco.

As solicitações pendentes não possuem expiração automática, a menos que esse recurso seja implementado separadamente. Se uma solicitação não for mais válida, o locador deverá cancelá-la pelo painel.

## Publicação

O site pode ser hospedado em serviços de hospedagem estática, como o GitHub Pages.

Após publicar os arquivos, verifique se:

- A página inicial carrega corretamente.
- As imagens e os estilos são exibidos.
- A conexão com o Supabase funciona no endereço publicado.
- As URLs de autenticação do Supabase permitem o acesso ao painel no domínio publicado.
- O cadastro e o gerenciamento de reservas funcionam conforme as políticas de segurança configuradas.

O GitHub Pages hospeda os arquivos do site, enquanto o Supabase continua responsável pelos dados e pela autenticação.

## Contato

O botão de WhatsApp utiliza o número configurado no projeto. Para alterar o contato, atualize os links correspondentes no `index.html` e no `js/script.js`.

## Observações

Este projeto foi desenvolvido para facilitar o processo de