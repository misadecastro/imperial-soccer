# Parity Requirements Checklist: Migração do Frontend para Angular

**Purpose**: Validar a qualidade dos requisitos de Paridade Funcional Total (US1) — completude, clareza, consistência e mensurabilidade — antes de tratá-los como base confiável para validação de implementação
**Created**: 2026-06-27
**Feature**: [spec.md](../spec.md) — foco em User Story 1 (P1) e nos elementos de Edge Cases/Assumptions que a sustentam
**Depth**: Padrão

**Note**: Este checklist avalia a ESCRITA dos requisitos (são completos? claros? consistentes? mensuráveis?) — não verifica se a implementação Angular já entregue está correta.

## Requirement Completeness

- [ ] CHK001 - É especificado, de forma acessível a quem lê apenas a spec, o mapeamento entre as "14 features" (002–014) e o número real de páginas/rotas que as implementam? [Gap, Spec §FR-001, §FR-007]
- [ ] CHK002 - Os requisitos cobrem explicitamente o fluxo de cadastro de aluno (feature 002) nos cenários de aceitação de US1, ou apenas chamada/avaliação/jogo são exemplificados? [Completeness, Spec §US1 Acceptance Scenario 3]
- [ ] CHK003 - Existe um requisito que defina o comportamento esperado para o treinador quando uma versão antiga da página está aberta durante o deploy (orientação para recarregar), além de descrevê-lo apenas como Edge Case? [Gap, Spec §Edge Cases]
- [ ] CHK004 - Os requisitos definem o que constitui uma "divergência" reportável durante a validação manual de paridade (ex.: erro de console, diferença visual, diferença de dado)? [Gap, Spec §US1 Independent Test]
- [ ] CHK005 - É especificado um requisito de rollback ou contenção para o caso de uma página migrada falhar na validação após já estar em uso pelo treinador? [Gap]
- [ ] CHK006 - Os requisitos cobrem o comportamento esperado quando o `sessionStorage` contém dados de uma versão futura/incompatível (ex.: campo novo não reconhecido pela página ainda não migrada)? [Gap, Spec §Edge Cases]

## Requirement Clarity

- [ ] CHK007 - O termo "sem perceber qualquer diferença de comportamento, aparência ou velocidade" (US1) é decomposto em critérios objetivos e verificáveis para cada dimensão (comportamento, aparência, velocidade)? [Clarity, Spec §US1]
- [ ] CHK008 - "Velocidade"/"tempo de carregamento percebido" é quantificado com um limiar numérico (ex.: ms, % de variação), em vez de "não aumenta de forma perceptível"? [Ambiguity, Spec §SC-005]
- [ ] CHK009 - "Sem mudanças perceptíveis de design" (FR-005) é definido com critério objetivo (ex.: diff de pixels, checklist visual) ou depende de julgamento subjetivo? [Measurability, Spec §FR-005]
- [ ] CHK010 - O termo "páginas" é usado de forma consistente com um número específico ao longo da spec (FR-007 cita "14 páginas", mas a lista de exemplos e as demais seções sugerem um número menor de arquivos de página)? [Ambiguity, Spec §FR-007]
- [ ] CHK011 - "Mesma estrutura de dados" (FR-002) inclui explicitamente os tipos/valores válidos de cada campo (ex.: enumeração de status de presença), ou apenas os nomes dos arrays de nível superior? [Clarity, Spec §FR-002]

## Requirement Consistency

- [ ] CHK012 - A contagem de "14 features/páginas" (US1, FR-001, FR-007) é consistente com a lista de arquivos de página citada explicitamente em FR-007 ("dashboard.html, students.html, games.html, training.html, student-eval.html e demais")? [Conflict, Spec §FR-007]
- [ ] CHK013 - A Assumption de que "páginas Angular e páginas HTML/JS puro coexistem durante a transição" é consistente com o Edge Case que trata da mesma coexistência, sem contradição sobre por quanto tempo essa coexistência é aceitável? [Consistency, Spec §Assumptions, §Edge Cases]
- [ ] CHK014 - O nível de rigor da "paridade total" (US1, sem nenhuma diferença) é consistente com a aceitação explícita de entrega incremental por página (FR-007), considerando que durante a transição duas implementações distintas coexistem? [Consistency, Spec §US1, §FR-007]

## Acceptance Criteria Quality

- [ ] CHK015 - SC-001 ("100% dos fluxos... funcionam de forma idêntica") define quem valida, com que frequência e como o resultado é registrado, para ser auditável como critério de aceite? [Measurability, Spec §SC-001]
- [ ] CHK016 - SC-002 ("zero perda ou corrupção de dados") especifica como a perda/corrupção seria detectada (ex.: comparação de snapshot antes/depois), para ser objetivamente verificável? [Measurability, Spec §SC-002]
- [ ] CHK017 - SC-005 define um método de medição para "tempo de carregamento percebido" (ex.: métrica de performance específica), tornando o critério testável em vez de subjetivo? [Measurability, Spec §SC-005]
- [ ] CHK018 - Existe critério de aceite que feche explicitamente a User Story 1 como "concluída" (ex.: todas as N páginas validadas), distinto dos critérios de sucesso agregados da spec inteira? [Gap, Spec §SC-001]

## Scenario Coverage

- [ ] CHK019 - Os cenários de aceitação de US1 cobrem o caso de um aluno sem nenhum dado relacionado (avaliações/jogos/chamadas vazios), ou apenas o caminho com dados presentes? [Coverage, Edge Case, Spec §US1]
- [ ] CHK020 - Há cenário (ou requisito) que cubra explicitamente a navegação entre páginas migradas e não migradas dentro da mesma sessão do treinador, validando que ambas leem/escrevem o mesmo estado sem conflito perceptível ao usuário? [Coverage, Spec §Edge Cases]
- [ ] CHK021 - Os cenários de aceitação cobrem o fluxo de exclusão de dados (ex.: excluir aluno, avaliação, jogo, treino) como parte da "paridade total", ou apenas os fluxos de criação/leitura? [Gap, Spec §US1 Acceptance Scenarios]

## Edge Case Coverage

- [ ] CHK022 - É definido o comportamento esperado quando um componente compartilhado (US2) introduz um defeito que afeta múltiplas páginas simultaneamente — isso é tratado apenas como expectativa de US2 ou também como risco a ser mitigado nos requisitos de paridade de US1? [Coverage, Spec §Edge Cases]
- [ ] CHK023 - Os requisitos definem o que acontece se o navegador do treinador não suportar algum recurso assumido pelo Angular, alguma forma de detecção/feedback, ou isso é puramente "fora de escopo" sem nenhuma salvaguarda? [Gap, Spec §Edge Cases]

## Dependencies & Assumptions

- [ ] CHK024 - A dependência de uma emenda prévia da constituição (MAJOR) está referenciada como pré-requisito formal de aceite da spec, e não apenas como nota em Assumptions? [Traceability, Spec §Assumptions]
- [ ] CHK025 - A assunção de que a integração com a API .NET/MongoDB é "trabalho futuro fora de escopo" é consistente com FR-008 ("nenhuma chamada de API nova"), sem deixar ambíguo se chamadas de API *já existentes* (se houver) estão dentro ou fora do escopo desta migração? [Consistency, Spec §FR-008, §Assumptions]
- [ ] CHK026 - Está documentada a suposição sobre por quanto tempo (ou até qual condição) a coexistência entre páginas migradas e não migradas é considerada aceitável antes de ser tratada como risco? [Assumption, Gap, Spec §Assumptions]

## Notes

- Foco solicitado: requisitos de Paridade Funcional Total (US1); itens de US2/US3 foram incluídos apenas quando se cruzam diretamente com o risco de paridade (ex.: defeito em componente compartilhado, coexistência de versões).
- Achado de maior risco: CHK010/CHK012 — inconsistência de contagem entre "14 páginas" (texto dos requisitos) e a lista real de arquivos de página citada na própria spec. Vale resolver antes de reutilizar esta spec como referência para migrações futuras.
- Itens marcados `[Gap]` indicam ausência de requisito, não necessariamente um erro — podem ser decisões conscientes de simplificação (Princípio I da constituição) que vale documentar explicitamente como tal.
