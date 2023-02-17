import React from 'react';
import { useState, useRef } from 'react';
import axios from 'axios';
import { Row, Col } from '@zendeskgarden/react-grid';
import { Field, Label, Checkbox, Fieldset, MediaInput } from '@zendeskgarden/react-forms';
import { Alert } from '@zendeskgarden/react-notifications';
import { Dots } from '@zendeskgarden/react-loaders';
import { Span } from '@zendeskgarden/react-typography';

function OpenAI({ client: client }) {
  const [input, setInput] = useState('');
  const [lastQuestion, setLastQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [appendToComment, setAppendToComment] = useState(false);
  const inputRef = useRef(null);
  const [error, setError] = useState('');

  const url = 'https://api.openai.com/v1/completions';

  const data = {
    model: 'text-davinci-003',
    // model: "curie:ft-personal-2023-02-14-22-06-56",
    prompt: input,
    max_tokens: 1000,
    n: 1,
    stop: '.'
  };

  function handleAppendToComment() {
    setAppendToComment(!appendToComment);
  }

  const handleKeyDown = async (event) => {
    if (event.key === 'Enter') {
      handleSubmit(event);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setLastQuestion(input);
    setError('');

    const token = await client.metadata().then(function (metadata) {
      return metadata.settings.token;
    });

    try {
      const result = await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const response = result.data.choices[0].text;
      setLoading(false);
      setResponse(response);

      if (appendToComment) {
        client.invoke('ticket.comment.appendText', response);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      setError(error.message);
    }

    setInput('');
    inputRef.current.focus();
  };

  return (
    <div>
      {error && (
        <Row>
          <Col size="auto">
            <Alert type="error">{error}</Alert>
          </Col>
        </Row>
      )}
      <Row>
        <Col size="auto">
          <Fieldset>
            <Fieldset.Legend>Hi! I'm Zlippy. Would you like help?</Fieldset.Legend>
            <Field>
              <MediaInput
                placeholder="Ask a question and press enter"
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
              />
            </Field>
            <Field>
              <Checkbox checked={appendToComment} onChange={handleAppendToComment}>
                <Label>Append To Comment</Label>
              </Checkbox>
            </Field>
          </Fieldset>
        </Col>
      </Row>
      <Row>
        <Col size="auto">
          <Span isBold>Question: </Span>
          <Span>{lastQuestion}</Span>
        </Col>
      </Row>
      <Row>
        <Col size="auto">
          <Span isBold>Response: </Span>
          {loading ? <Dots /> : <Span>{response}</Span>}
        </Col>
      </Row>
    </div>
  );
}

export default OpenAI;
