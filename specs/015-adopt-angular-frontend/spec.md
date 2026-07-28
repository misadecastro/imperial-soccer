# Feature Specification: Migração do Frontend para Angular

**Feature Branch**: `015-adopt-angular-frontend`  
**Created**: 2026-06-27  
**Status**: Draft  
**Input**: User description: "vamos aplicar angular como framework do front no projeto"

## User Scenarios & Testing *(mandatory)*

<!--
  Esta feature é uma migração estrutural do frontend (todas as 14 páginas existentes
  passam a ser construídas em Angular, mantendo sessionStorage como camada de dados).
  Não há nova capacidade visível para o treinador — o objetivo é preservar 100% do
  comportamento atual com uma base de código mais sustentável para a equipe de
  desenvolvimento. Por isso, "usuário" aparece em dois papéis: o treinador (que não
  deve perceber nenhuma diferença) e a equipe de desenvolvimento (que ganha
  componentização e tipagem).
-->

### User Story 1 - Paridade Funcional Total para o Treinador (Priority: P1)

O treinador continua usando todas as telas do sistema (dashboard, alunos, jogos, treinos, avaliações) exatamente como hoje, sem perceber qualquer diferença de comportamento, aparência ou velocidade após a migração para Angular.

**Why this priority**: É a condição inegociável da migração. Se qualquer fluxo existente quebrar ou mudar de comportamento, a migração causa dano direto ao usuário final e não pode ser considerada concluída.

**Independent Test**: Pode ser testado executando o roteiro de uso de cada uma das 14 features existentes (002 a 014) na versão Angular e comparando o resultado com o comportamento documentado nas specs originais — qualquer divergência é uma falha.

**Acceptance Scenarios**:

1. **Given** o treinador acessando o dashboard de treinos, **When** ele seleciona uma categoria e visualiza os gráficos de volume e distribuição, **Then** os mesmos dados e gráficos aparecem exatamente como na versão atual em HTML/JS puro.
2. **Given** o treinador no dashboard do aluno, **When** ele seleciona um aluno e navega pelas seções (resumo de treinos, jogos, evolução técnico-tática-mental), **Then** todas as seções renderizam com os mesmos dados, na mesma ordem, sem erros.
3. **Given** o treinador registrando uma chamada, uma avaliação ou um jogo, **When** ele preenche e salva o formulário, **Then** os dados são persistidos em `sessionStorage` sob a chave `imperialState`, com a mesma estrutura usada hoje, e refletidos imediatamente nas demais telas.
4. **Given** uma sessão de navegador já aberta com dados salvos antes da migração, **When** o treinador recarrega qualquer página migrada, **Then** os dados existentes em `sessionStorage` continuam sendo lidos corretamente, sem perda de informação.

---

### User Story 2 - Componentização Reutilizável para a Equipe de Desenvolvimento (Priority: P2)

A equipe de desenvolvimento passa a construir e modificar telas usando componentes reutilizáveis (cards de resumo, gráficos, listas, formulários, seletor de categoria) em vez de duplicar HTML e JavaScript em cada página, reduzindo o esforço e o risco de inconsistência ao evoluir o produto.

**Why this priority**: É o principal benefício de negócio da migração — sem isso, trocar de framework não se justifica. Mas a migração ainda entrega valor parcial (P1) mesmo que a componentização inicial seja limitada, então fica em segundo lugar.

**Independent Test**: Pode ser testado identificando um elemento de UI repetido em pelo menos 3 das páginas atuais (ex.: seletor de categoria, card de métrica) e confirmando que, na versão Angular, existe um único componente reutilizado nas 3 páginas, em vez de três implementações HTML/JS separadas.

**Acceptance Scenarios**:

1. **Given** o padrão de "seletor de categoria" usado em `dashboard.html`, `games.html`, `students.html` e `training.html`, **When** a equipe migra essas páginas, **Then** as quatro passam a usar um único componente Angular de seletor de categoria.
2. **Given** um card de métrica resumida (ex.: "Presenças", "Min em Jogo"), **When** esse padrão se repete em mais de uma tela, **Then** ele é implementado como um único componente parametrizável.
3. **Given** uma mudança visual ou de comportamento em um componente compartilhado, **When** a equipe altera esse componente, **Then** a mudança se reflete automaticamente em todas as páginas que o utilizam, sem edição manual em cada arquivo.

---

### User Story 3 - Detecção de Erros em Tempo de Build (Priority: P3)

A equipe de desenvolvimento identifica erros de tipo, referências a campos inexistentes ou chamadas de função incorretas durante o build/compilação, antes que o código chegue ao navegador do treinador.

**Why this priority**: Reduz bugs em produção, mas é um ganho incremental de qualidade de processo — não bloqueia a entrega da migração funcional (P1) nem da componentização (P2).

**Independent Test**: Pode ser testado introduzindo deliberadamente um erro de tipo (ex.: acessar um campo que não existe em um objeto de avaliação) no código-fonte e confirmando que o processo de build falha antes de gerar os arquivos finais, em vez de falhar silenciosamente apenas no navegador.

**Acceptance Scenarios**:

1. **Given** um componente Angular que espera um campo `tatico: number` em uma avaliação, **When** um desenvolvedor tenta acessar um campo com nome incorreto (ex.: `tatic`), **Then** o build falha com um erro de compilação apontando o arquivo e a linha exatos.
2. **Given** o conjunto de páginas migradas, **When** a equipe executa o comando de build, **Then** o processo conclui com sucesso somente se não houver erros de tipo, antes de qualquer deploy.

---

### Edge Cases

- O que acontece com sessões de navegador abertas durante o deploy da nova versão (treinador com a página antiga aberta enquanto a nova já está no servidor)? O sistema deve orientar o treinador a recarregar a página; dados em `sessionStorage` não são perdidos pois a chave e estrutura não mudam.
- O que acontece se uma página ainda não migrada precisar referenciar dados gravados por uma página já migrada (período de transição)? Como a chave e o esquema de `sessionStorage` permanecem idênticos, ambas as versões devem conseguir ler e escrever os mesmos dados sem conflito.
- Como o sistema lida com um navegador que não suporta os recursos mínimos exigidos pelo Angular (ex.: navegadores muito antigos)? Fora de escopo — o público-alvo já é limitado a "navegadores modernos 2023+", conforme padrão vigente do projeto.
- O que acontece se um componente reutilizável usado em múltiplas páginas apresentar um defeito? O defeito se manifesta em todas as páginas que o utilizam — isso é esperado e deve ser corrigido no componente compartilhado, não em cada página individualmente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST reproduzir, em Angular, o comportamento funcional completo das 14 features já implementadas (specs 001 a 014), sem remover, alterar ou degradar nenhum fluxo existente.
- **FR-002**: O sistema MUST continuar persistindo todos os dados em `sessionStorage` sob a chave `imperialState`, mantendo exatamente a mesma estrutura de dados (`alunos`, `avaliacoes`, `chamadas`, `jogos`) usada pela versão atual.
- **FR-003**: O sistema MUST permitir que múltiplas páginas compartilhem o mesmo componente de UI quando o padrão visual e comportamental for idêntico (ex.: seletor de categoria, cards de métrica, gráficos de evolução).
- **FR-004**: O sistema MUST detectar, em tempo de build, erros de tipo e referências inválidas a campos de dados antes que o código seja disponibilizado ao treinador.
- **FR-005**: O sistema MUST preservar a aparência visual atual (Tailwind CSS, paleta de cores, ícones) sem mudanças perceptíveis de design durante a migração.
- **FR-006**: O sistema MUST manter todos os gráficos existentes (Chart.js) funcionando com os mesmos dados, cores e comportamento de interação (hover/tooltip).
- **FR-007**: A migração MUST cobrir as 14 páginas existentes (`dashboard.html`, `students.html`, `games.html`, `training.html`, `student-eval.html` e demais), entregues de forma incremental por página ou grupo de páginas, sem exigir uma troca simultânea de todas de uma só vez.
- **FR-008**: O sistema MUST continuar funcionando inteiramente no navegador, sem exigir backend adicional além do que já existe hoje (nenhuma chamada de API nova introduzida apenas pela migração de framework).

### Key Entities

Esta feature não introduz novas entidades de domínio — reorganiza a implementação das entidades já existentes (Aluno, Avaliação, Frequência/Chamada, Jogo) em componentes e serviços Angular, sem alterar seus campos ou relacionamentos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos fluxos de uso documentados nas specs 002 a 014 funcionam de forma idêntica na versão Angular, validados por execução manual de cada roteiro de teste original.
- **SC-002**: Zero perda ou corrupção de dados em `sessionStorage` ao alternar entre páginas migradas e não migradas durante o período de transição.
- **SC-003**: Pelo menos 5 padrões de UI hoje duplicados em múltiplas páginas (seletor de categoria, cards de métrica, gráficos, listas, formulários) passam a existir como um único componente reutilizado.
- **SC-004**: 100% das páginas migradas passam por build sem erros de tipo antes de qualquer entrega ao treinador.
- **SC-005**: O tempo de carregamento percebido pelo treinador em qualquer página migrada não aumenta de forma perceptível em relação à versão atual.

## Assumptions

- **Conflito com a constituição vigente**: A [constituição do projeto](../../.specify/memory/constitution.md) (v1.0.0, ratificada em 2026-04-04) atualmente proíbe frameworks no frontend e exige operação sem build step. Esta feature pressupõe uma emenda MAJOR da constituição (autorizada pelo usuário) antes de avançar para `/speckit.plan` — a emenda deve ser feita como etapa prévia e independente desta spec.
- Migração cobre as 14 páginas existentes (features 001–014); nenhuma nova funcionalidade de negócio é adicionada como parte desta migração — é puramente uma mudança de arquitetura de apresentação.
- A camada de dados permanece em `sessionStorage` com a chave `imperialState` e o esquema atual; a integração com o backend .NET/MongoDB descrito na constituição é tratada como trabalho futuro, fora do escopo desta feature.
- A migração pode ser entregue de forma incremental, página por página ou em pequenos grupos, permitindo que páginas Angular e páginas HTML/JS puro coexistam durante a transição, desde que ambas leiam e escrevam o mesmo formato de dados em `sessionStorage`.
- O público-alvo de navegadores permanece "navegadores modernos 2023+", sem necessidade de suporte a navegadores legados.
- Identidade visual (Tailwind CSS, paleta de cores `imperial`, Chart.js) é preservada; a migração não inclui redesign.
