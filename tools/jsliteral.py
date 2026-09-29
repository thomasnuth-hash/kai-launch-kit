"""A small reader for the JavaScript object literals the tile maker uses.

Handles what actually appears in that file: unquoted keys, single/double/back
quoted strings, numbers, booleans, null, nested objects and arrays, trailing
commas and // comments. Deliberately refuses anything with code in it rather
than guessing — a function or a ${} interpolation means the value is not data
and must not be moved into the token file.
"""

class JSLiteralError(ValueError):
    pass


def parse(src, name="<literal>"):
    p = _P(src, name)
    v = p.value()
    p.ws()
    if p.i < len(p.s):
        raise JSLiteralError(f"{name}: trailing input at {p.i}")
    return v


class _P:
    def __init__(self, s, name):
        self.s, self.i, self.name = s, 0, name

    def err(self, msg):
        raise JSLiteralError(f"{self.name}: {msg} at offset {self.i}")

    def ws(self):
        s = self.s
        while self.i < len(s):
            c = s[self.i]
            if c in " \t\r\n":
                self.i += 1
            elif s.startswith("//", self.i):
                j = s.find("\n", self.i)
                self.i = len(s) if j < 0 else j + 1
            elif s.startswith("/*", self.i):
                j = s.find("*/", self.i)
                if j < 0: self.err("unterminated comment")
                self.i = j + 2
            else:
                return

    def value(self):
        self.ws()
        if self.i >= len(self.s): self.err("unexpected end")
        c = self.s[self.i]
        if c == "{": return self.obj()
        if c == "[": return self.arr()
        if c in "'\"`": return self.string()
        if self.s.startswith("true", self.i):  self.i += 4; return True
        if self.s.startswith("false", self.i): self.i += 5; return False
        if self.s.startswith("null", self.i):  self.i += 4; return None
        if c == "-" or c.isdigit() or c == ".": return self.number()
        if c.isalpha() or c in "_$":
            word = self._word()
            self.err(f"bare identifier {word!r} — this is code, not data")
        self.err(f"unexpected {c!r}")

    def _word(self):
        j = self.i
        while j < len(self.s) and (self.s[j].isalnum() or self.s[j] in "_$"): j += 1
        return self.s[self.i:j]

    def obj(self):
        self.i += 1
        out = {}
        while True:
            self.ws()
            if self.i >= len(self.s): self.err("unterminated object")
            if self.s[self.i] == "}": self.i += 1; return out
            if self.s[self.i] in "'\"`":
                k = self.string()
            else:
                k = self._word()
                if not k: self.err("expected a key")
                self.i += len(k)
            self.ws()
            if self.i >= len(self.s) or self.s[self.i] != ":": self.err("expected ':'")
            self.i += 1
            out[k] = self.value()
            self.ws()
            if self.i < len(self.s) and self.s[self.i] == ",": self.i += 1

    def arr(self):
        self.i += 1
        out = []
        while True:
            self.ws()
            if self.i >= len(self.s): self.err("unterminated array")
            if self.s[self.i] == "]": self.i += 1; return out
            out.append(self.value())
            self.ws()
            if self.i < len(self.s) and self.s[self.i] == ",": self.i += 1

    def string(self):
        q = self.s[self.i]; self.i += 1
        buf = []
        while True:
            if self.i >= len(self.s): self.err("unterminated string")
            c = self.s[self.i]
            if c == "\\":
                nxt = self.s[self.i+1]
                buf.append({"n":"\n","t":"\t","r":"\r","\\":"\\","'":"'",'"':'"',"`":"`","/":"/"}
                           .get(nxt, "\\"+nxt))
                self.i += 2
                continue
            if c == q:
                self.i += 1
                return "".join(buf)
            if q == "`" and self.s.startswith("${", self.i):
                self.err("template interpolation — this is code, not data")
            buf.append(c); self.i += 1

    def number(self):
        j = self.i
        while j < len(self.s) and self.s[j] in "-+.eE0123456789": j += 1
        txt = self.s[self.i:j]; self.i = j
        try:
            return int(txt) if ("." not in txt and "e" not in txt.lower()) else float(txt)
        except ValueError:
            self.err(f"bad number {txt!r}")
