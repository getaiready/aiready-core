import { describe, it, expect } from 'vitest';
import {
  generateReportHead,
  generateReportHero,
  generateStatCards,
  generateTable,
  generateIssueSummary,
  generateReportFooter,
  wrapInCard,
  generateCompleteReport,
  generateStandardHtmlReport,
} from '../utils/report-formatters';

describe('report-formatters', () => {
  describe('generateReportHead', () => {
    it('should generate head with title and styles', () => {
      const result = generateReportHead('My Title', 'body { color: red; }');
      expect(result).toContain('<title>My Title</title>');
      expect(result).toContain('body { color: red; }');
      expect(result).toContain('charset="UTF-8"');
      expect(result).toContain('viewport');
    });
  });

  describe('generateReportHero', () => {
    it('should generate hero with title and optional subtitle', () => {
      const result = generateReportHero('Main Title', 'Sub Title');
      expect(result).toContain('<h1>Main Title</h1>');
      expect(result).toContain('<p>Sub Title</p>');
      expect(result).toContain('class="hero"');
    });

    it('should generate hero without subtitle', () => {
      const result = generateReportHero('Main Title');
      expect(result).not.toContain('<p>');
    });
  });

  describe('generateStatCards', () => {
    it('should generate grid of stat cards', () => {
      const cards = [
        { value: 100, label: 'Score', color: 'green' },
        { value: '50', label: 'Issues' },
      ];
      const result = generateStatCards(cards);
      expect(result).toContain('100');
      expect(result).toContain('Score');
      expect(result).toContain('color: green');
      expect(result).toContain('50');
      expect(result).toContain('Issues');
    });
  });

  describe('generateTable', () => {
    it('should generate HTML table', () => {
      const config = {
        headers: ['H1', 'H2'],
        rows: [
          ['R1C1', 'R1C2'],
          ['R2C1', 'R2C2'],
        ],
      };
      const result = generateTable(config);
      expect(result).toContain(
        '<table><thead><tr><th>H1</th><th>H2</th></tr></thead>'
      );
      expect(result).toContain('<tbody><tr><td>R1C1</td><td>R1C2</td></tr>');
    });
  });

  describe('generateIssueSummary', () => {
    it('should generate summary with savings', () => {
      const result = generateIssueSummary(1, 2, 3, 1000);
      expect(result).toContain('Critical: 1');
      expect(result).toContain('Major: 2');
      expect(result).toContain('Minor: 3');
      expect(result).toContain('Potential Savings:');
      expect(result).toContain('1');
      expect(result).toContain('000 tokens');
    });

    it('should generate summary without savings', () => {
      const result = generateIssueSummary(0, 0, 0);
      expect(result).not.toContain('Potential Savings');
    });
  });

  describe('generateReportFooter', () => {
    it('should generate footer with links', () => {
      const options = {
        packageName: 'test-pkg',
        version: '1.0.0',
        packageUrl: 'https://github.com/test',
        bugUrl: 'https://github.com/test/issues',
        title: 'Title',
      };
      const result = generateReportFooter(options);
      expect(result).toContain('@aiready/test-pkg');
      expect(result).toContain('v1.0.0');
      expect(result).toContain('href="https://github.com/test"');
      expect(result).toContain('href="https://github.com/test/issues"');
    });
  });

  describe('wrapInCard', () => {
    it('should wrap content in card', () => {
      const result = wrapInCard('some content', 'Card Title');
      expect(result).toContain('<h2>Card Title</h2>');
      expect(result).toContain('some content');
    });
  });

  describe('generateCompleteReport', () => {
    it('should generate full HTML document', () => {
      const options = { title: 'T', packageName: 'P' };
      const result = generateCompleteReport(options, '<h1>Body</h1>');
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<body><h1>Body</h1>');
    });
  });

  describe('generateStandardHtmlReport', () => {
    it('should generate standard report with optional score', () => {
      const options = { title: 'T', packageName: 'P', emoji: '✨' };
      const stats = [{ value: 10, label: 'L' }];
      const sections = [{ title: 'S1', content: 'C1' }];
      const score = { value: 85, label: 'Good' };

      const result = generateStandardHtmlReport(
        options,
        stats,
        sections,
        score
      );
      expect(result).toContain('✨ AIReady T');
      expect(result).toContain('85');
      expect(result).toContain('Good');
      expect(result).toContain('C1');
      expect(result).toContain('S1');
    });

    it('should handle missing score', () => {
      const options = { title: 'T', packageName: 'P' };
      const result = generateStandardHtmlReport(options, [], [], undefined);
      expect(result).not.toContain('score-card');
    });
  });
});
